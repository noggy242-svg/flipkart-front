"use server";

export async function getFlipkartPrice(url: string) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
            next: { revalidate: 0 } // Ensure no caching for real-time data
        });

        if (!response.ok) {
            return { error: "Failed to fetch product details. Please check the URL or try again later." };
        }

        const html = await response.text();

        // 1. Extract Price
        // Try different common price selectors
        let price = null;
        const priceRegexes = [
            /class="Nx9bqj _4b5DiR">₹([^<]+)</,
            /class="_30jeq3 _16Jk6d">₹([^<]+)</,
            /class="Nx9W0j">₹([^<]+)</,
            /₹([\d,]+)/ // Fallback generic price
        ];

        for (const regex of priceRegexes) {
            const match = html.match(regex);
            if (match) {
                price = match[1].trim();
                break;
            }
        }

        // 2. Extract Product Title
        let title = "Flipkart Product";
        const titleRegexes = [
            /class="VU-Z7G">([^<]+)</,
            /class="B_NuCI">([^<]+)</,
            /class="yhB1nd">([^<]+)</,
            /<title>([^<]+)<\/title>/
        ];

        for (const regex of titleRegexes) {
            const match = html.match(regex);
            if (match) {
                title = match[1].trim();
                // Clean up title if it's the full page title
                if (title.includes("Buy")) {
                    title = title.split("Buy")[0].trim();
                }
                break;
            }
        }

        // 3. Extract Image URL
        let image = null;
        const imageRegexes = [
            /class="DByo_b[^>]+src="([^"]+)"/,
            /class="_396cs4[^>]+src="([^"]+)"/,
            /src="([^"]+flipkart.com\/image\/[^"]+)"/
        ];

        for (const regex of imageRegexes) {
            const match = html.match(regex);
            if (match) {
                image = match[1];
                break;
            }
        }

        if (!price) {
            return { error: "Found the product, but couldn't extract the price. Flipkart might have changed its layout." };
        }

        return {
            price,
            title,
            image,
            timestamp: new Date().toLocaleTimeString(),
            success: true
        };
    } catch (error) {
        console.error("Scraping error:", error);
        return { error: "An unexpected error occurred while tracking the price." };
    }
}
