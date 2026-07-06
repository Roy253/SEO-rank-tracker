import { chromium } from "playwright-core";
import Browserbase from "@browserbasehq/sdk";

const bb = new Browserbase({
    apiKey: process.env.BROWSERBASE_API_KEY,
});

// Search Google for a keyword and extract ranking results for a target domain
export async function rankTracker(keyword, targetDomain) {
    let browser;

    try {
        // 1. Initialize Browserbase Session & Connect Playwright
        const session = await bb.sessions.create({
            browserSettings: {
                blockAds: true,
            },
        });

        browser = await chromium.connectOverCDP(session.connectUrl);

        const context = browser.contexts()[0];
        const page = context.pages()[0] || (await context.newPage());

        page.setDefaultNavigationTimeout(45000);

        // 2. Initial Google Visit & Consent Handling
        await page.goto("https://www.google.com", {
            waitUntil: "networkidle",
        });

        try {
            const btn = await page.$(
                'button[id="L2AGLb"], form[action*="consent"] button'
            );

            if (btn) {
                await btn.click();
                await page.waitForTimeout(1500);
            }
        } catch {}

        let found = null;
        const allResults = [];

        const cleanTarget = targetDomain
            .replace(/^https?:\/\//, "")
            .replace("www.", "")
            .toLowerCase();

        // 3. Search Loop: Iterate through up to 5 pages
        for (let gPage = 0; gPage < 5; gPage++) {
            await page.goto(
                `https://www.google.com/search?q=${encodeURIComponent(
                    keyword
                )}&start=${gPage * 10}&num=10&hl=en&gl=us`,
                {
                    waitUntil: "networkidle",
                }
            );

            let pageResults = [];

            // 4. Retry if results don't load
            for (let retry = 0; retry < 3; retry++) {
                try {
                    await page.waitForSelector("h3", {
                        timeout: 8000,
                    });

                    await page.waitForTimeout(1500);

                    pageResults = await page.evaluate(() =>
                        Array.from(document.querySelectorAll("h3"))
                            .map((h3) => {
                                let a = h3.closest("a");

                                if (!a) {
                                    let p = h3.parentElement;

                                    for (
                                        let j = 0;
                                        j < 5 && p;
                                        j++, p = p.parentElement
                                    ) {
                                        if (p.tagName === "A") {
                                            a = p;
                                            break;
                                        }

                                        const sub = p.querySelector("a[href]");

                                        if (sub && sub.contains(h3)) {
                                            a = sub;
                                            break;
                                        }
                                    }
                                }

                                if (
                                    !a ||
                                    !a.href.startsWith("http") ||
                                    a.href.includes("google.")
                                ) {
                                    return null;
                                }

                                let snippet = "";
                                let c = a.parentElement;

                                for (
                                    let j = 0;
                                    j < 6 && c;
                                    j++, c = c.parentElement
                                ) {
                                    const txt = c.innerText || "";

                                    if (
                                        txt.length >
                                        h3.innerText.length + 50
                                    ) {
                                        snippet =
                                            txt
                                                .split("\n")
                                                .find(
                                                    (line) =>
                                                        line.length > 30 &&
                                                        !line.includes(
                                                            h3.innerText
                                                        )
                                                ) || "";

                                        break;
                                    }
                                }

                                let domain = "";

                                try {
                                    domain = new URL(a.href)
                                        .hostname
                                        .replace("www.", "")
                                        .toLowerCase();
                                } catch {}

                                return {
                                    title: h3.innerText.trim(),
                                    url: a.href,
                                    domain,
                                    snippet: snippet.trim(),
                                };
                            })
                            .filter(Boolean)
                    );

                    if (pageResults.length > 0) break;

                    await page.reload({
                        waitUntil: "networkidle",
                    });
                } catch {
                    if (retry === 2) break;

                    await page.reload({
                        waitUntil: "networkidle",
                    });
                }
            }

            if (!pageResults.length) break;

            // 5. Check for target domain
            for (let i = 0; i < pageResults.length; i++) {
                const r = pageResults[i];

                r.position = gPage * 10 + i + 1;
                r.page = gPage + 1;

                allResults.push(r);

                if (
                    r.domain === cleanTarget ||
                    r.domain.endsWith(`.${cleanTarget}`)
                ) {
                    found = r;
                    break;
                }
            }

            if (found) break;

            await page.waitForTimeout(
                2000 + Math.random() * 2000
            );
        }

        await browser.close();

        const competitors = allResults
            .filter(
                (r) =>
                    !r.domain.includes(cleanTarget) &&
                    !cleanTarget.includes(r.domain)
            )
            .slice(0, 10);

        return {
            success: true,
            data: {
                keyword,
                targetDomain,
                position: found?.position || null,
                page: found?.page || null,
                title: found?.title || "",
                snippet: found?.snippet || "",
                competitors,
                totalResultsScanned: allResults.length,
            },
        };
    } catch (error) {
        console.error("Rank check error:", error.message);

        if (browser) {
            await browser.close().catch(() => {});
        }

        return {
            success: false,
            error: error.message,
        };
    }
}