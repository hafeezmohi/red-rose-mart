import React from 'react';

export const numberToWords = (num) => {
    const a = ['', 'ONE ', 'TWO ', 'THREE ', 'FOUR ', 'FIVE ', 'SIX ', 'SEVEN ', 'EIGHT ', 'NINE ', 'TEN ', 'ELEVEN ', 'TWELVE ', 'THIRTEEN ', 'FOURTEEN ', 'FIFTEEN ', 'SIXTEEN ', 'SEVENTEEN ', 'EIGHTEEN ', 'NINETEEN '];
    const b = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

    if ((num = num.toString()).length > 9) return 'overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return;

    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'CRORE ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'LAKH ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'THOUSAND ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'HUNDRED ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'AND ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'ONLY ' : '';
    return str.trim() + ' RUPEES ONLY';
};

export default function PrintableReceipt({ order }) {
    if (!order) return null;

    const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalItems = order.items.length;
    const totalMRP = order.items.reduce((sum, item) => sum + ((item.originalPrice || item.product?.price || item.price) * item.quantity), 0);
    const totalRate = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalDiscount = totalMRP - totalRate;

    return (
        <>
            {/* --- Global Print Styles --- */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    @media print {
                        @page { margin: 0; padding: 0; size: 80mm auto; }
                        html, body { background: white; margin: 0 !important; padding: 0 !important; -webkit-print-color-adjust: exact; }
                    }
                `
            }} />

            {/* --- Print Receipt Layout (Hidden on Screen, Visible on Print) --- */}
            <div className="hidden print:block w-[80mm] p-2 text-black text-xs font-sans" style={{ maxWidth: "80mm", margin: 0 }}>
                {/* Header */}
                <div className="text-center mb-2 leading-tight">
                    <h1 className="font-extrabold text-[22px] m-0 mb-1">Red Rose Mart</h1>
                    <p className="m-0 text-[11px] font-bold">Beside Mamatha Hospital</p>
                    <p className="m-0 text-[11px] font-bold">Subash Road, Ambedkar Chowk</p>
                    <p className="m-0 text-[11px] font-bold">Kagaznagar, Telangana, 504296</p>
                    <p className="m-0 text-[11px] font-bold">Phone : 8074559488</p>
                </div>

                <div className="text-center font-extrabold underline mb-2 text-[13px]">
                    Tax Invoice
                </div>

                {/* Metadata */}
                <div className="flex justify-between text-[11px] mb-2 font-bold leading-tight">
                    <div>
                        <p className="m-0">Tax Invoice # {order._id.slice(-5).toUpperCase()}</p>
                        <p className="m-0">User : {order.user?.name || "Customer"}</p>
                    </div>
                    <div className="text-right">
                        <p className="m-0">Date : {new Date(order.createdAt || new Date()).toLocaleDateString("en-IN", { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '-')}</p>
                        <p className="m-0">Time : {new Date(order.createdAt || new Date()).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                    </div>
                </div>

                <div className="border-t-[1.5px] border-dashed border-black mb-1"></div>

                {/* Items Table Headers */}
                <div className="flex text-[11px] font-bold mb-1">
                    <div className="w-full">
                        <div className="flex w-full justify-between">
                            <span>Item Name</span>
                            <span className="w-12 text-right">MRP</span>
                            <span className="w-12 text-right">Qty</span>
                            <span className="w-14 text-right">Rate(₹)</span>
                            <span className="w-16 text-right">Amount(₹)</span>
                        </div>
                    </div>
                </div>
                
                <div className="border-t-[1.5px] border-dashed border-black mb-1"></div>

                {/* Items */}
                <div className="text-[11px] font-bold mb-2">
                    {order.items.map((item, i) => {
                        const mrp = item.originalPrice || item.product?.price || item.price;
                        return (
                            <div key={i} className="mb-1 leading-tight">
                                <div className="uppercase">{item.name}</div>
                                <div className="flex justify-end space-x-1">
                                    <span className="w-12 text-right">{mrp.toFixed(2)}</span>
                                    <span className="w-12 text-right">{Number(item.quantity).toFixed(2)}</span>
                                    <span className="w-14 text-right">{item.price.toFixed(2)}</span>
                                    <span className="w-16 text-right">{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="border-t-[1.5px] border-dashed border-black mb-1"></div>

                {/* Totals Block */}
                <div className="flex justify-between text-[11px] font-bold mb-1 leading-tight">
                    <div>
                        <p className="m-0">Total Qty : {totalQty.toFixed(2)}</p>
                        <p className="m-0">Total Items : {totalItems.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                        <p className="m-0">Total MRP : ₹ {totalMRP.toFixed(2)}</p>
                        <p className="m-0">Discount : ₹ {totalDiscount.toFixed(2)}</p>
                    </div>
                </div>

                <div className="border-t-[1.5px] border-dashed border-black mb-1"></div>

                {/* Final Total */}
                <div className="flex justify-between items-center text-[22px] font-extrabold mb-1 mt-1">
                    <span>TOTAL :</span>
                    <span>₹ {order.totalPrice}</span>
                </div>
                <div className="text-center text-[10px] font-bold uppercase mb-2">
                    {numberToWords(order.totalPrice)}
                </div>

                <div className="border-t-[1.5px] border-dashed border-black mb-2 mt-2"></div>

                {/* Footer */}
                <div className="text-[11px] font-bold uppercase text-center space-y-1">
                    <p className="m-0 text-left">TERMS & CONDITIONS</p>
                    <p className="m-0 text-[12px] mt-1">THANK YOU VISIT AGAIN</p>
                    <p className="m-0">SHOP TIMINGS : 7AM TILL 10PM</p>
                    {totalDiscount > 0 && (
                        <p className="m-0 text-[13px] mt-2 pb-2">** You have saved Rs. {totalDiscount.toFixed(2)} **</p>
                    )}
                </div>

                {/* Empty space at the bottom for paper cutting allowance */}
                <div className="h-10"></div>
            </div>
        </>
    );
}
