import re

with open('index.html', 'r') as f:
    content = f.read()

# Replace help-tab content to include FAQs and fix whatsapp number
help_tab_search = """            <!-- Help Center Tab -->
            <div id="help-tab" class="profile-tab-content" style="display: none;">
                <h3 class="luxury-font" style="color: var(--gold); margin-bottom: 20px;">VIP Support</h3>
                <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 20px;">For priority assistance with your botanical rituals or orders, connect with our Sommelier.</p>
                <button class="btn-main" style="background-color: #25D366; border: none; color: #000; width: 100%; margin-bottom: 15px;" onclick="window.open('https://wa.me/910000000000', '_blank')">Contact via WhatsApp</button>
                <p style="text-align: center; color: var(--text-muted); font-size: 13px;">Email: <a href="mailto:houseofsomaca@gmail.com" style="color: var(--gold);">houseofsomaca@gmail.com</a></p>
            </div>"""

help_tab_replace = """            <!-- Help Center Tab -->
            <div id="help-tab" class="profile-tab-content" style="display: none;">
                <h3 class="luxury-font" style="color: var(--gold); margin-bottom: 20px;">VIP Support</h3>
                <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 20px;">For priority assistance with your botanical rituals or orders, connect with our Sommelier.</p>
                <button class="btn-main" style="background-color: #25D366; border: none; color: #000; width: 100%; margin-bottom: 15px;" onclick="window.open('https://wa.me/918373960622', '_blank')">Contact via WhatsApp</button>
                <p style="text-align: center; color: var(--text-muted); font-size: 13px;">Email: <a href="mailto:houseofsomaca@gmail.com" style="color: var(--gold);">houseofsomaca@gmail.com</a></p>

                <h4 class="luxury-font" style="color: var(--gold); margin-top: 30px; margin-bottom: 15px;">Quick FAQs</h4>
                <div style="text-align: left; background: rgba(0,0,0,0.4); padding: 15px; border-radius: 6px; border: 1px solid var(--border-subtle);">
                    <p style="color: #fff; font-size: 13px; font-weight: bold;">How long does delivery take?</p>
                    <p style="color: var(--text-muted); font-size: 12px; margin-bottom: 15px;">Standard delivery takes 5-7 business days across India.</p>

                    <p style="color: #fff; font-size: 13px; font-weight: bold;">Is the product 100% natural?</p>
                    <p style="color: var(--text-muted); font-size: 12px;">Yes, SOMACA uses pure botanical extracts with zero chemical fillers.</p>
                </div>
            </div>"""

content = content.replace(help_tab_search, help_tab_replace)

with open('index.html', 'w') as f:
    f.write(content)

# Update Script.js to add printInvoice button to orders
with open('Script.js', 'r') as f:
    script_content = f.read()

script_search = """                        <button class="btn-main" style="flex: 1; padding: 6px; font-size: 11px; background: transparent; border: 1px solid var(--gold); color: var(--gold);" onclick="viewOrderTracking('${o.orderId}')">Track Order</button>
                    </div>"""

script_replace = """                        <button class="btn-main" style="flex: 1; padding: 6px; font-size: 11px; background: transparent; border: 1px solid var(--gold); color: var(--gold);" onclick="viewOrderTracking('${o.orderId}')">Track Order</button>
                        <button class="btn-main" style="flex: 1; padding: 6px; font-size: 11px; background: transparent; border: 1px solid var(--gold); color: var(--gold);" onclick="printHistoricalInvoice('${o.orderId}')">Invoice</button>
                    </div>"""

script_content = script_content.replace(script_search, script_replace)

# Add printHistoricalInvoice function
print_hist_invoice_func = """

function printHistoricalInvoice(orderId) {
    let allOrders = JSON.parse(localStorage.getItem('somaca_orders') || '[]');
    let foundOrder = allOrders.find(o => o.orderId === orderId);
    if(foundOrder) {
        let tempCurrent = currentOrder;
        currentOrder = foundOrder;
        printInvoice();
        currentOrder = tempCurrent;
    } else {
        showToast("Invoice not found.", "error");
    }
}
"""

if "function printHistoricalInvoice" not in script_content:
    script_content += print_hist_invoice_func

with open('Script.js', 'w') as f:
    f.write(script_content)
