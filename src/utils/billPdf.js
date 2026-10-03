import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const money = (n) =>
  `Rs. ${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const safe = (value, fallback = "-") =>
  value === undefined ||
  value === null ||
  value === ""
    ? fallback
    : String(value);

const round2 = (value) =>
  Math.round(
    (Number(value || 0) + Number.EPSILON) * 100,
  ) / 100;

// ======================================================
// GST BREAKDOWN
// ======================================================
//
// Retail price is GST EXCLUSIVE.
//
// Example:
//
// Retail Price = ₹14.58
// GST Rate     = 18%
//
// GST          = ₹14.58 × 18%
//              = ₹2.62
//
// CGST         = ₹1.31
// SGST         = ₹1.31
//
// Final        = ₹14.58 + ₹2.62
//              = ₹17.20
//
// ======================================================

const getGstBreakdown = (
  taxableAmount,
  gstRate,
) => {
  const taxable = Number(
    taxableAmount || 0,
  );

  const rate = Number(
    gstRate || 0,
  );

  if (
    taxable <= 0 ||
    rate <= 0
  ) {
    return {
      taxable: round2(taxable),
      gst: 0,
      cgst: 0,
      sgst: 0,
      total: round2(taxable),
    };
  }

  const gst = round2(
    (taxable * rate) / 100,
  );

  const cgst = round2(
    gst / 2,
  );

  const sgst = round2(
    gst - cgst,
  );

  const total = round2(
    taxable + gst,
  );

  return {
    taxable: round2(taxable),
    gst,
    cgst,
    sgst,
    total,
  };
};

// ======================================================
// CREATE BILL PDF
// ======================================================

export function createBillPdf(
  bill,
  options = {},
) {
  if (!bill) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 16;

  const pageWidth =
    doc.internal.pageSize.getWidth();

  // ====================================================
  // HEADER
  // ====================================================

  doc.setFont(
    "helvetica",
    "bold",
  );

  doc.setFontSize(20);

  doc.setTextColor(
    15,
    23,
    42,
  );

  doc.text(
    options.businessName ||
      "TAX INVOICE",
    margin,
    20,
  );

  doc.setFont(
    "helvetica",
    "normal",
  );

  doc.setFontSize(9);

  doc.setTextColor(
    100,
    116,
    139,
  );

  doc.text(
    options.subtitle ||
      "Billing Invoice",
    margin,
    26,
  );

  // ====================================================
  // INVOICE NUMBER
  // ====================================================

  doc.setFont(
    "helvetica",
    "bold",
  );

  doc.setFontSize(11);

  doc.setTextColor(
    15,
    23,
    42,
  );

  doc.text(
    "INVOICE",
    pageWidth - margin,
    20,
    {
      align: "right",
    },
  );

  doc.setFont(
    "helvetica",
    "normal",
  );

  doc.setFontSize(9);

  doc.setTextColor(
    100,
    116,
    139,
  );

  doc.text(
    safe(
      bill.billNo,
    ),
    pageWidth - margin,
    26,
    {
      align: "right",
    },
  );

  // ====================================================
  // HEADER LINE
  // ====================================================

  doc.setDrawColor(
    226,
    232,
    240,
  );

  doc.line(
    margin,
    32,
    pageWidth - margin,
    32,
  );

  // ====================================================
  // CUSTOMER DETAILS
  // ====================================================

  const storeName =
    bill.store?.name ||
    bill.storeName ||
    options.storeName ||
    "Store";

  const customerName =
    bill.customerName ||
    "Walk-in customer";

  const customerPhone =
    bill.customerPhone ||
    "Not provided";

  doc.setFont(
    "helvetica",
    "bold",
  );

  doc.setFontSize(9);

  doc.setTextColor(
    51,
    65,
    85,
  );

  doc.text(
    "BILL TO",
    margin,
    40,
  );

  doc.setFont(
    "helvetica",
    "normal",
  );

  doc.setFontSize(10);

  doc.setTextColor(
    15,
    23,
    42,
  );

  doc.text(
    customerName,
    margin,
    46,
  );

  doc.setFontSize(9);

  doc.setTextColor(
    100,
    116,
    139,
  );

  doc.text(
    `Phone: ${customerPhone}`,
    margin,
    52,
  );

  // ====================================================
  // STORE DETAILS
  // ====================================================

  doc.setFont(
    "helvetica",
    "bold",
  );

  doc.setFontSize(9);

  doc.setTextColor(
    51,
    65,
    85,
  );

  doc.text(
    "STORE",
    pageWidth / 2,
    40,
  );

  doc.setFont(
    "helvetica",
    "normal",
  );

  doc.setFontSize(10);

  doc.setTextColor(
    15,
    23,
    42,
  );

  doc.text(
    storeName,
    pageWidth / 2,
    46,
  );

  const dateText =
    bill.createdAt
      ? new Date(
          bill.createdAt,
        ).toLocaleString(
          "en-IN",
        )
      : "-";

  doc.setFontSize(9);

  doc.setTextColor(
    100,
    116,
    139,
  );

  doc.text(
    `Date: ${dateText}`,
    pageWidth / 2,
    52,
  );

  doc.text(
    `Payment: ${safe(
      bill.paymentMethod,
      "CASH",
    )}`,
    pageWidth / 2,
    58,
  );

  // ====================================================
  // PREPARE INVOICE ITEMS
  // ====================================================
  //
  // IMPORTANT:
  //
  // retailPrice is GST EXCLUSIVE.
  //
  // Billing:
  //
  // taxable = retailPrice × qty
  // gst     = taxable × gstRate / 100
  // total   = taxable + gst
  //
  // ====================================================

  const invoiceItems =
    (bill.items || []).map(
      (item) => {
        const qty = Number(
          item.qty || 0,
        );

        const rate = Number(
          item.retailPrice ??
            item.price ??
            0,
        );

        const gstRate =
          Number(
            item.gstRate || 0,
          );

        const taxable =
          round2(
            rate * qty,
          );

        const gst =
          getGstBreakdown(
            taxable,
            gstRate,
          );

        return {
          item,

          qty,

          rate,

          gstRate,

          taxable:
            gst.taxable,

          gst:
            gst.gst,

          cgst:
            gst.cgst,

          sgst:
            gst.sgst,

          total:
            gst.total,
        };
      },
    );

  // ====================================================
  // TABLE ROWS
  // ====================================================

  const rows =
    invoiceItems.map(
      (entry, index) => [
        index + 1,

        safe(
          entry.item.name,
          "Item",
        ),

        entry.qty,

        money(
          entry.rate,
        ),

        `${entry.gstRate}%`,

        money(
          entry.taxable,
        ),
      ],
    );

  // ====================================================
  // PRODUCT TABLE
  // ====================================================

  autoTable(doc, {
    startY: 66,

    head: [
      [
        "#",
        "Description of Goods",
        "Qty",
        "Rate",
        "Tax %",
        "Amount",
      ],
    ],

    body: rows,

    margin: {
      left: margin,
      right: margin,
    },

    styles: {
      font: "helvetica",

      fontSize: 8.5,

      cellPadding: 3,

      textColor: [
        51,
        65,
        85,
      ],

      lineColor: [
        226,
        232,
        240,
      ],

      lineWidth: 0.2,
    },

    headStyles: {
      fillColor: [
        15,
        23,
        42,
      ],

      textColor: [
        255,
        255,
        255,
      ],

      fontStyle: "bold",
    },

    columnStyles: {
      0: {
        cellWidth: 9,
        halign: "center",
      },

      2: {
        cellWidth: 14,
        halign: "center",
      },

      3: {
        halign: "right",
      },

      4: {
        cellWidth: 16,
        halign: "center",
      },

      5: {
        halign: "right",
      },
    },
  });

  // ====================================================
  // CALCULATE TOTALS
  // ====================================================

  const totals =
    invoiceItems.reduce(
      (acc, entry) => {
        acc.taxable +=
          entry.taxable;

        acc.cgst +=
          entry.cgst;

        acc.sgst +=
          entry.sgst;

        acc.gst +=
          entry.gst;

        acc.total +=
          entry.total;

        return acc;
      },
      {
        taxable: 0,
        cgst: 0,
        sgst: 0,
        gst: 0,
        total: 0,
      },
    );

  totals.taxable =
    round2(
      totals.taxable,
    );

  totals.cgst =
    round2(
      totals.cgst,
    );

  totals.sgst =
    round2(
      totals.sgst,
    );

  totals.gst =
    round2(
      totals.gst,
    );

  totals.total =
    round2(
      totals.total,
    );

  // ====================================================
  // USE BACKEND TOTALS WHEN AVAILABLE
  // ====================================================
  //
  // Backend now stores:
  //
  // subtotal
  // gstTotal
  // grandTotal
  //
  // So PDF uses those values as source of truth.
  //
  // ====================================================

  const backendSubtotal =
    Number(
      bill.subtotal,
    );

  const backendGstTotal =
    Number(
      bill.gstTotal,
    );

  const backendGrandTotal =
    Number(
      bill.grandTotal,
    );

  if (
    Number.isFinite(
      backendSubtotal,
    )
  ) {
    totals.taxable =
      round2(
        backendSubtotal,
      );
  }

  if (
    Number.isFinite(
      backendGstTotal,
    )
  ) {
    totals.gst =
      round2(
        backendGstTotal,
      );

    // CGST + SGST
    // Split equally.
    totals.cgst =
      round2(
        totals.gst / 2,
      );

    totals.sgst =
      round2(
        totals.gst -
          totals.cgst,
      );
  }

  if (
    Number.isFinite(
      backendGrandTotal,
    )
  ) {
    totals.total =
      round2(
        backendGrandTotal,
      );
  } else {
    totals.total =
      round2(
        totals.taxable +
          totals.gst,
      );
  }

  // ====================================================
  // GST SUMMARY
  // ====================================================

  let y =
    (doc.lastAutoTable
      ?.finalY || 66) + 9;

  const summaryX =
    pageWidth -
    margin -
    78;

  const valueX =
    pageWidth -
    margin;

  doc.setFont(
    "helvetica",
    "bold",
  );

  doc.setFontSize(9);

  doc.setTextColor(
    51,
    65,
    85,
  );

  doc.text(
    "GST SUMMARY",
    summaryX,
    y,
  );

  y += 6;

  doc.setFont(
    "helvetica",
    "normal",
  );

  doc.setFontSize(8.5);

  doc.setTextColor(
    100,
    116,
    139,
  );

  // ====================================================
  // SUBTOTAL
  // ====================================================

  doc.text(
    "Subtotal",
    summaryX,
    y,
  );

  doc.text(
    money(
      totals.taxable,
    ),
    valueX,
    y,
    {
      align: "right",
    },
  );

  // ====================================================
  // CGST
  // ====================================================

  y += 6;

  doc.text(
    "CGST",
    summaryX,
    y,
  );

  doc.text(
    money(
      totals.cgst,
    ),
    valueX,
    y,
    {
      align: "right",
    },
  );

  // ====================================================
  // SGST
  // ====================================================

  y += 6;

  doc.text(
    "SGST",
    summaryX,
    y,
  );

  doc.text(
    money(
      totals.sgst,
    ),
    valueX,
    y,
    {
      align: "right",
    },
  );

  // ====================================================
  // TOTAL GST
  // ====================================================

  y += 6;

  doc.setFont(
    "helvetica",
    "bold",
  );

  doc.setTextColor(
    51,
    65,
    85,
  );

  doc.text(
    "Total GST",
    summaryX,
    y,
  );

  doc.text(
    money(
      totals.gst,
    ),
    valueX,
    y,
    {
      align: "right",
    },
  );

  // ====================================================
  // DIVIDER
  // ====================================================

  y += 8;

  doc.setDrawColor(
    203,
    213,
    225,
  );

  doc.line(
    summaryX,
    y - 4,
    valueX,
    y - 4,
  );

  // ====================================================
  // NET AMOUNT
  // ====================================================

  doc.setFont(
    "helvetica",
    "bold",
  );

  doc.setFontSize(12);

  doc.setTextColor(
    15,
    23,
    42,
  );

  doc.text(
    "Net Amount",
    summaryX,
    y + 3,
  );

  doc.text(
    money(
      totals.total,
    ),
    valueX,
    y + 3,
    {
      align: "right",
    },
  );

  // ====================================================
  // GST NOTE
  // ====================================================

  y += 18;

  doc.setFont(
    "helvetica",
    "normal",
  );

  doc.setFontSize(8);

  doc.setTextColor(
    100,
    116,
    139,
  );

  doc.text(
    `GST @ applicable rate. Total GST: ${money(
      totals.gst,
    )}`,
    pageWidth / 2,
    y,
    {
      align: "center",
    },
  );

  // ====================================================
  // FOOTER
  // ====================================================

  y += 6;

  doc.text(
    options.footer ||
      "Thank you for your business.",
    pageWidth / 2,
    y,
    {
      align: "center",
    },
  );

  // ====================================================
  // SAVE PDF
  // ====================================================

  const filename =
    `${safe(
      bill.billNo,
      "invoice",
    )}`
      .replace(
        /[^a-z0-9_-]/gi,
        "_",
      )
      .toLowerCase() +
    ".pdf";

  doc.save(filename);
}