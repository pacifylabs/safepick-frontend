export function Footer() {
    const currentYear = new Date().getFullYear();

    const columns = [
        {
            title: "Product",
            links: [
                { label: "Features", href: "#features" },
                { label: "How it works", href: "#how-it-works" },
                { label: "Pricing", href: "#pricing" },
                { label: "Roadmap", href: "#" }
            ]
        },
        {
            title: "For schools",
            links: [
                { label: "School portal", href: "#" },
                { label: "Request a demo", href: "#" },
                { label: "Integration guide", href: "#" }
            ]
        },
        {
            title: "Company",
            links: [
                { label: "About us", href: "#" },
                { label: "Blog", href: "#" },
                { label: "Contact", href: "#" },
                { label: "Privacy policy", href: "#" }
            ]
        }
    ];

    return (
        <footer className="bg-navy text-white">
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <a href="/" className="flex items-center gap-2 mb-4">
                            <span className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </span>
                            <span className="font-bold text-lg tracking-tight">SafePick</span>
                        </a>
                        <p className="text-sm text-white/60 leading-relaxed max-w-[200px]">
                            Verified, real-time child release. Peace of mind for every parent.
                        </p>
                    </div>

                    {/* Nav columns */}
                    {columns.map((col) => (
                        <div key={col.title}>
                            <h4 className="text-xs font-bold tracking-widest uppercase text-white/40 mb-4">
                                {col.title}
                            </h4>
                            <ul className="flex flex-col gap-3">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="text-sm text-white/70 hover:text-white transition-colors"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Divider + legal */}
                <div className="mt-16 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-white/40">
                        © {currentYear} SafePick. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        {["Terms", "Privacy", "Cookie policy"].map((item) => (
                            <a key={item} href="#" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                                {item}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
