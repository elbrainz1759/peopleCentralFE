// Shared Mercy Corps logo for PDF headers (drawn top-right).
// The logo is fetched once from /public and cached as a data URL so the
// synchronous PDF generators can stamp it without async plumbing.

let cached: string | null = null;
let loading: Promise<string | null> | null = null;

export function preloadPdfLogo(): Promise<string | null> {
    if (cached) return Promise.resolve(cached);
    if (loading) return loading;
    if (typeof window === "undefined") return Promise.resolve(null);

    loading = fetch("/images/logo/brand-logo.png")
        .then((r) => (r.ok ? r.blob() : Promise.reject(new Error("logo fetch failed"))))
        .then(
            (blob) =>
                new Promise<string | null>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        cached = typeof reader.result === "string" ? reader.result : null;
                        resolve(cached);
                    };
                    reader.onerror = () => resolve(null);
                    reader.readAsDataURL(blob);
                })
        )
        .catch(() => null);

    return loading;
}

// Start loading as soon as this module is imported on the client.
if (typeof window !== "undefined") {
    preloadPdfLogo();
}

// Draw the logo in the top-right corner of the current page, preserving its
// aspect ratio. No-op (never throws) if the logo hasn't loaded yet.
export function addPdfLogo(doc: any) {
    if (!cached) return;
    try {
        const pageWidth = doc.internal.pageSize.getWidth();
        const maxH = 14;
        const maxW = 46;
        let w = 34;
        let h = 13;
        try {
            const p = doc.getImageProperties(cached);
            if (p?.width && p?.height) {
                const ratio = p.width / p.height;
                h = maxH;
                w = h * ratio;
                if (w > maxW) {
                    w = maxW;
                    h = w / ratio;
                }
            }
        } catch {
            /* getImageProperties unavailable — fall back to default size */
        }
        doc.addImage(cached, "PNG", pageWidth - w - 12, 8, w, h);
    } catch {
        /* never let the logo break PDF generation */
    }
}
