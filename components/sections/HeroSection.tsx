import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center overflow-hidden bg-off-white pt-16">
            {/* Decorative background blobs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-teal/5 blur-[80px] -translate-y-1/3 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-teal/5 blur-[60px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 grid md:grid-cols-2 gap-16 items-center">
                {/* Left copy */}
                <div>
                    <SectionLabel>Child safety, reimagined</SectionLabel>
                    <h1 className="mb-6">
                        You decide <em>who</em> picks up your child.
                    </h1>
                    <p className="text-base md:text-lg text-muted leading-relaxed mb-8 max-w-lg">
                        SafePick verifies every school pickup in real-time — with multi-step identity checks, instant parent notifications, and a full audit trail. So you always know who collected your child.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button variant="primary" size="lg" href="/signup">
                            Get started
                        </Button>
                        <Button variant="outline" size="lg" href="/login">
                            See how it works
                        </Button>
                    </div>

                    {/* Trust bar */}
                    <div className="mt-10 flex items-center gap-10 flex-wrap">
                        {[
                            { value: "3s", label: "Avg. verification time" },
                            { value: "99%", label: "Pickup accuracy" },
                            { value: "0", label: "Unauthorised releases" }
                        ].map((stat) => (
                            <div key={stat.label} className="flex flex-col">
                                <span className="text-2xl font-semibold text-navy font-display">{stat.value}</span>
                                <span className="text-[0.7rem] uppercase tracking-widest text-teal-mid font-medium">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right visual — app preview card */}
                <div className="relative hidden md:flex justify-center items-center">
                    {/* Floating card 1 — notification */}
                    <div className="absolute top-0 right-8 bg-white rounded-2xl shadow-card-hover p-4 w-64 animate-fade-in">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-teal/15 flex items-center justify-center">
                                <span className="text-base">🔔</span>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-navy">Pickup request</p>
                                <p className="text-[11px] text-muted-text">Uncle James · 2:58 PM</p>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <button className="flex-1 text-xs bg-teal text-white font-semibold py-1.5 rounded-lg">Approve ✓</button>
                            <button className="flex-1 text-xs border border-red-200 text-red-500 font-semibold py-1.5 rounded-lg">Deny</button>
                        </div>
                    </div>

                    {/* Main card */}
                    <div className="bg-navy rounded-3xl p-6 w-72 shadow-2xl mt-16">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-xs font-bold tracking-widest text-teal uppercase">Today's pickups</span>
                            <span className="text-xs text-white/40">Wed, 13 Mar</span>
                        </div>
                        {[
                            { name: "Amelia Chen", delegate: "Dad", time: "3:00 PM", status: "Verified", color: "bg-teal/20 text-teal" },
                            { name: "Liam Cooper", delegate: "Aunt Sarah", time: "3:15 PM", status: "Pending", color: "bg-cream/20 text-yellow-300" },
                            { name: "Zoe Adeyemi", delegate: "Mum", time: "3:30 PM", status: "Scheduled", color: "bg-white/10 text-white/60" }
                        ].map((entry) => (
                            <div key={entry.name} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                                <div>
                                    <p className="text-sm font-semibold text-white">{entry.name}</p>
                                    <p className="text-xs text-white/50">{entry.delegate} · {entry.time}</p>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${entry.color}`}>
                                    {entry.status}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Floating card 2 — success */}
                    <div className="absolute bottom-4 left-0 bg-white rounded-2xl shadow-card p-3 w-52 animate-fade-in">
                        <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-teal flex items-center justify-center text-sm text-white">✓</span>
                            <div>
                                <p className="text-xs font-semibold text-navy">Child released safely</p>
                                <p className="text-[11px] text-muted-text">Amelia — 3:02 PM</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
