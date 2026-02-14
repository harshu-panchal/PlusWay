import React from 'react';
import { ShieldCheck, Clock, FileCheck, HelpCircle } from 'lucide-react';

const Warranty = () => {
    return (
        <div className="mx-4 lg:mx-[10%] py-12 text-slate-800">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Warranty Policy</h1>
                    <p className="text-lg text-slate-600">Peace of mind with every purchase. Our commitment to quality and durability.</p>
                </div>

                <div className="space-y-12">
                    <section className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-teal-50 rounded-xl">
                                <ShieldCheck className="w-6 h-6 text-teal-600" />
                            </div>
                            <h2 className="text-2xl font-bold">What's Covered</h2>
                        </div>
                        <p className="mb-4">PlusWay provides a limited warranty on all physical products purchased from our official store. This warranty covers:</p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-600">
                            <li>Manufacturing defects in materials and workmanship.</li>
                            <li>Premature failure under normal usage conditions.</li>
                            <li>Functional issues not caused by external damage.</li>
                        </ul>
                    </section>

                    <section className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold">Warranty Period</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="border-l-4 border-teal-500 pl-4">
                                <h4 className="font-bold text-slate-900">1 Year Limited Warranty</h4>
                                <p className="text-sm text-slate-600">Cases, Screen Protectors, and Charging Cables.</p>
                            </div>
                            <div className="border-l-4 border-blue-500 pl-4">
                                <h4 className="font-bold text-slate-900">6 Months Limited Warranty</h4>
                                <p className="text-sm text-slate-600">Power Banks and Electronic Gadgets.</p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-red-50 rounded-xl">
                                <FileCheck className="w-6 h-6 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold">What's Not Covered</h2>
                        </div>
                        <ul className="list-disc pl-6 space-y-2 text-slate-600">
                            <li>Normal wear and tear (scratches, discoloration).</li>
                            <li>Accidental damage (dropped product, liquid spills).</li>
                            <li>Misuse or unauthorized modifications.</li>
                            <li>Purchases made through unauthorized third-party sellers.</li>
                        </ul>
                    </section>

                    <section className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-slate-200 rounded-xl">
                                <HelpCircle className="w-6 h-6 text-slate-700" />
                            </div>
                            <h2 className="text-2xl font-bold">How to Claim</h2>
                        </div>
                        <div className="space-y-4">
                            <p className="font-medium text-slate-900">Step 1: Gather Documentation</p>
                            <p className="text-sm text-slate-600">Keep your original order receipt and clear photos of the defect.</p>

                            <p className="font-medium text-slate-900">Step 2: Contact Support</p>
                            <p className="text-sm text-slate-600">Email us at support@plusway.com with your order number and issue description.</p>

                            <p className="font-medium text-slate-900">Step 3: Evaluation</p>
                            <p className="text-sm text-slate-600">Our team will review your claim and provide shipping instructions if a return is required.</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Warranty;
