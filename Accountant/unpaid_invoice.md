Request URL
https://beta.aipsoft.com/inout/reports/generate/unpaid_sales_invoices
Request Method
POST

https://beta.aipsoft.com/inout/reports/save_report_ua_data
https://beta.aipsoft.com/inout/reports/generate/unpaid_sales_invoices
https://beta.aipsoft.com/assets/js/popper.js
https://beta.aipsoft.com/assets/js/tippy.js
https://beta.aipsoft.com/assets/js/pdfobject.js
https://beta.aipsoft.com/assets/js/print.min.js
https://beta.aipsoft.com/inout/pdf_generate/getFontNames

Response
<link rel="stylesheet" type="text/css" href="https://beta.aipsoft.com/assets/css/report_table.css">
<link rel="stylesheet" type="text/css" href="https://beta.aipsoft.com/assets/css/backdrop.css">
<link rel="stylesheet" href="https://beta.aipsoft.com/assets/css/typeahead_css.css">
<script type="text/javascript" src="https://beta.aipsoft.com/assets/js/popper.js"></script>
<script type="text/javascript" src="https://beta.aipsoft.com/assets/js/tippy.js"></script>
<script type="text/javascript" src="https://beta.aipsoft.com/assets/js/pdfobject.js"></script>
<script type="text/javascript" src="https://beta.aipsoft.com/assets/js/print.min.js"></script>
<style type="text/css">
 .right_col{margin-left: 230px;}  
 .refresh_wrapper{float: left;width: 2%;}
 .refresh_wrapper a{float: left;font-size: 19px;cursor: pointer;}
 .grouping_div{padding-left: 0;width: 46%;}
 .tab-content {
    overflow: hidden;
    clear: both;
    padding: 10px;
    background-color: #ffffff;
    -webkit-box-shadow: 0px 0px 7px 0px rgba(214,214,214,1);
    -moz-box-shadow: 0px 0px 7px 0px rgba(214,214,214,1);
    box-shadow: 0px 0px 7px 0px rgba(214,214,214,1);
} 
li.selected a{background-color: #4a324c52 !important;color: #ffffff !important;}
.recent_select{background: #759fb3;}
tr.group{background: #00800061;text-align: center;font-weight: bold;}
.table_col_width{width:25%;float:right;}
.closing_stock_h4{float: left;}
.close-popup{display: none;}
.sidenav {
    top: 120px;
    left: 230px;
}
 tr.group-subtotal{background: #00800030;font-weight: bold;}
.paging_full_numbers{width:100%;}
</style>
   <div class="right_col fit-width" >
        <!-- <div class="pdf_drag"> -->
            <div class="pdf_wraper invisibl">
                <p>Preview</p>
                <button type="button" class="pdf_cancel_btn">Cancel</button>
                <button type="button" class="pdf_print_btn">Print</button>
            </div>
            <div id="pdf_holder" class="invisibl">
            </div>    
        <!-- </div> -->
        <div id="mySidenav" class="sidenav">
                                       
            <div class="left-slide-box">
                <h4><img src="https://beta.aipsoft.com/assets/images/iconfinder_b.png">Sales</h4>
                 
                <ul>
                                        <li data-slug="sales_report" class="side_reports">Sales Invoice</li>
                                    <li data-slug="sales_by_item_customer" class="side_reports">Sales by Item/Customer</li>
                                    <li data-slug="sales_by_item_customer_summary" class="side_reports">Sales by Item/Customer Summary</li>
                                    <li data-slug="sales_invoice_product_consolidated" class="side_reports">Sales Invoice - Product Consolidated</li>
                                    <li data-slug="sales_invoice_product_departments" class="side_reports">Sales Invoice - Product Departments</li>
                                    <li data-slug="sales_return" class="side_reports">Sales Return</li>
                                    <li data-slug="sales_return_by_item_customer" class="side_reports">Sales Return by Item/Customer</li>
                                    <li data-slug="sales_invoice_only_with_payment_info" class="side_reports">Sales Invoice With Payment Info</li>
                                    <li data-slug="sales_invoice_profit_lpr" class="side_reports">Sales Invoice Profit - Last Purchase Rate</li>
                                    <li data-slug="sales_invoice_pw_profit_lpr" class="side_reports">Sales Invoice Profit - Product Wise - Last Purchase Rate</li>
                                    <li data-slug="sales_invoice_sales_return" class="side_reports">Sales Invoice & Sales Return</li>
                                    <li data-slug="sales_invoice_sales_return_prdt_wise" class="side_reports">Sales Invoice & Sales Return - Product Wise</li>
                                    <li data-slug="store_sales_report" class="side_reports">Store sales</li>
                                    <li data-slug="sales_department_daywise" class="side_reports">Sales Report Department Day Wise - Payment Type</li>
                                    <li data-slug="sales_invoice_daywise" class="side_reports">Sales Invoice Day Wise</li>
                                    <li data-slug="sales_order" class="side_reports">Sales Order</li>
                                    <li data-slug="sales_order_by_item_customer" class="side_reports">Sales Order by Item/Customer</li>
                                    <li data-slug="sales_order_by_item_customer_summary" class="side_reports">Sales Order by Item/Customer Summary</li>
                                    <li data-slug="sales_order_product_consolidated" class="side_reports">Sales Order Product Consolidated</li>
                                    <li data-slug="sales_order_product_departments" class="side_reports">Sales Order - Product Departments</li>
                                    <li data-slug="sales_and_salesorder" class="side_reports">Sales & Sales Order</li>
                                    <li data-slug="sales_and_salesorder_item_customer" class="side_reports">Sales & Sales Order Item/Customer</li>
                                    <li data-slug="sales_and_salesorder_product_consolidated" class="side_reports">Sales & Sales Order Product Consolidated</li>
                                    <li data-slug="sales_and_salesorder_department" class="side_reports">Sales & Sales Order Department</li>
                                    <li data-slug="sales_and_salesorder_department_salesman" class="side_reports">Sales & Sales Order Department-Salesman Wise</li>
                                    <li data-slug="cancelled_sales_report" class="side_reports">Cancelled Sales Report</li>
                                    <li data-slug="cancelled_sales_and_salesorder" class="side_reports">Cancelled Sales & Sales Order Report</li>
                                    <li data-slug="sales_invoice_pw_profit_lpr_consolidated" class="side_reports">Sales Invoice Profit - Product Wise - Last Purchase Rate Consolidated</li>
                                    <li data-slug="delivery_note" class="side_reports">Delivery Note</li>
                                    <li data-slug="delivery_by_item_customer" class="side_reports">Delivery Note by Item/Customer</li>
                                    <li data-slug="sales_report_discounted_product" class="side_reports">Sales Order discounted product report</li>
                                </ul>
                        </div>
                                       
            <div class="left-slide-box">
                <h4><img src="https://beta.aipsoft.com/assets/images/iconfinder_b.png">POS-Sales</h4>
                 
                <ul>
                                        <li data-slug="shift_data" class="side_reports">Day Closing Report</li>
                                    <li data-slug="counter_cash" class="side_reports">Counter Cash</li>
                                    <li data-slug="sales_report_hour_wise" class="side_reports">Sales Report - Hour wise</li>
                                    <li data-slug="counter_day_end_report" class="side_reports">Counter Day End Report</li>
                                    <li data-slug="unpaid_sales_invoices" class="side_reports">Unpaid Sales Invoices</li>
                                    <li data-slug="driver_report" class="side_reports">Driver Statement</li>
                                </ul>
                        </div>
                                       
            <div class="left-slide-box">
                <h4><img src="https://beta.aipsoft.com/assets/images/iconfinder_b.png">Payment Received</h4>
                 
                <ul>
                                        <li data-slug="payment_received_sales_and_order" class="side_reports">Payment Received On Sales & Order (Advance)</li>
                                    <li data-slug="payment_received_day_month" class="side_reports">Payment Received Day/Month Wise</li>
                                    <li data-slug="payment_rec_report" class="side_reports">Payment Received Report (POS Only)</li>
                                    <li data-slug="payment_received_on_order" class="side_reports">Payment Received On Order (Advance)</li>
                                    <li data-slug="payment_received_on_sales" class="side_reports">Payment Received On Sales</li>
                                    <li data-slug="unpaid_paid_invoices" class="side_reports">Unpaid Paid Sales (Payment of unpaid invoices)</li>
                                </ul>
                        </div>
                                       
            <div class="left-slide-box">
                <h4><img src="https://beta.aipsoft.com/assets/images/iconfinder_b.png">Accounts</h4>
                 
                <ul>
                                        <li data-slug="ledger_report" class="side_reports">Ledger Report</li>
                                    <li data-slug="expense_report" class="side_reports">Expense Report</li>
                                    <li data-slug="profit_lose" class="side_reports">Profit & Lose</li>
                                    <li data-slug="trial_balance" class="side_reports">Trial Balance</li>
                                    <li data-slug="balance_sheet" class="side_reports">Balance Sheet</li>
                                    <li data-slug="account_balance" class="side_reports">Account Balance</li>
                                    <li data-slug="accounts_cash_flow" class="side_reports">Cash A/c Flow Report</li>
                                    <li data-slug="cash_flow" class="side_reports">Cash & Bank Flow Report</li>
                                    <li data-slug="branch_report" class="side_reports">Branch Ledger Report</li>
                                    <li data-slug="receivables_and_payables_with_periods" class="side_reports">Receivables And Payables With Periods</li>
                                    <li data-slug="customer_invoice_statement" class="side_reports">Customer Invoice Statement (Sales & Return)</li>
                                    <li data-slug="customer_statement_groupwise" class="side_reports">Customer Statement Group Wise</li>
                                    <li data-slug="receivables_and_payables" class="side_reports">Receivables And Payables</li>
                                </ul>
                        </div>
                                       
            <div class="left-slide-box">
                <h4><img src="https://beta.aipsoft.com/assets/images/iconfinder_b.png">Purchase</h4>
                 
                <ul>
                                        <li data-slug="purchase_report" class="side_reports">Purchase Report</li>
                                    <li data-slug="purch_product_wise" class="side_reports">Purchase - Product wise
</li>
                                    <li data-slug="grn_report" class="side_reports">GRN Report</li>
                                    <li data-slug="grn_product_wise" class="side_reports">GRN - Product Wise</li>
                                    <li data-slug="grv_report" class="side_reports">GRV Report</li>
                                    <li data-slug="grv_product_wise" class="side_reports">GRV - Product Wise</li>
                                    <li data-slug="purchase_return_report" class="side_reports">Purchase Return</li>
                                    <li data-slug="purchase_return_product_wise" class="side_reports">Purchase Return - Product Wise</li>
                                    <li data-slug="payment_made_purch" class="side_reports">Payment Made On Purchase</li>
                                    <li data-slug="product_vendor_purchase_consolidated" class="side_reports">Product/Vendor History Consolidated</li>
                                    <li data-slug="purch_product_wise_unit_summery" class="side_reports">Purchase Product Wise Unit Summery</li>
                                </ul>
                        </div>
                                       
            <div class="left-slide-box">
                <h4><img src="https://beta.aipsoft.com/assets/images/iconfinder_b.png">Inventory</h4>
                 
                <ul>
                                        <li data-slug="stock_flow_report" class="side_reports">Stock Ledger</li>
                                    <li data-slug="product_stock" class="side_reports">Product Stock</li>
                                    <li data-slug="inventory_reg" class="side_reports">Inventory Register</li>
                                    <li data-slug="inventory_reg_detailed" class="side_reports">Inventory Register - Details</li>
                                    <li data-slug="product_list" class="side_reports">Product List</li>
                                    <li data-slug="invenotry_item_request" class="side_reports">Item Request</li>
                                    <li data-slug="invenotry_item_request_details" class="side_reports">Item Request Details</li>
                                    <li data-slug="invenotry_item_request_summary" class="side_reports">Item Request Summary</li>
                                    <li data-slug="purch_price_change_hist" class="side_reports">Purchase Price Change History</li>
                                    <li data-slug="stock_movement" class="side_reports">Stock Movement</li>
                                    <li data-slug="stock_movement_detailed" class="side_reports">Stock Movement Detailed</li>
                                    <li data-slug="stock_transfer" class="side_reports">Stock Transfer</li>
                                    <li data-slug="invenotry_item_request_consolidated" class="side_reports">Item Request Consolidated</li>
                                    <li data-slug="product_stock_unit_wise" class="side_reports">Product Stock Unit Wise</li>
                                    <li data-slug="inventory_adjustment_detailed_rpt" class="side_reports">Stock Adjustment Detailed Report</li>
                                    <li data-slug="factory_inventory_report" class="side_reports">Inventory Details</li>
                                    <li data-slug="stock_report_as_on_new" class="side_reports">Stock Report As On</li>
                                    <li data-slug="multi_rate_product_list" class="side_reports">Multi Rate - Products List</li>
                                </ul>
                        </div>
                                       
            <div class="left-slide-box">
                <h4><img src="https://beta.aipsoft.com/assets/images/iconfinder_b.png">TAX</h4>
                 
                <ul>
                                        <li data-slug="vat_report" class="side_reports">VAT Report</li>
                                </ul>
                        </div>
                                       
            <div class="left-slide-box">
                <h4><img src="https://beta.aipsoft.com/assets/images/iconfinder_b.png">Projects</h4>
                 
                <ul>
                                        <li data-slug="sales_invoice_project_wise" class="side_reports">Sales Invoice - Project Wise</li>
                                    <li data-slug="purchase_invoice_project_wise" class="side_reports">Purchase Invoice - Project Wise</li>
                                    <li data-slug="project_report" class="side_reports">Project Report</li>
                                </ul>
                        </div>
                                       
            <div class="left-slide-box">
                <h4><img src="https://beta.aipsoft.com/assets/images/iconfinder_b.png">Property</h4>
                 
                <ul>
                                        <li data-slug="property_assigned" class="side_reports">Property Assigned</li>
                                </ul>
                        </div>
                    </div>
        <!-- Slide  -->
        <div class="overflow-header"></div>
        <div class="report_header">
            <!-- <button type="button" class="modal__close" data-dismiss="modal">×</button> --> <span class="" id="toggleMenu"><i class="fas fa-ellipsis-v"></i></span>
            <a href="#" class="close-popup" data-id="cashflow" data-animation="slide">×</a>
            <div class="header_btn_wrap">
                <div class="header_btn_text direct_print">
                    <img src="https://beta.aipsoft.com/assets/images/print-1.png">
                    <h6>Print</h6>
                </div>
                <div class="top-btn-dropdown">
                    <div class="header_btn"> <span><img src="https://beta.aipsoft.com/assets/images/arrow-bottom.png"></span>
                    </div>
                    <input type="hidden" name="gender">
                    <ul class="top-btn-dropdown-menu">
                        <li id="printcurrentpages" class="each_print_option" data-type="current_page"><i class="fas fa-print re_drp_icon"></i> Print Current Page</li>
                        <li id="printallpages" class="each_print_option" data-type="all_pages"><i class="fas fa-print re_drp_icon"></i> Print All Pages</li>
                        <li id="printcustomepages" class="each_print_option"><i class="fas fa-print re_drp_icon"></i> Print Custom Pages</li>
                        <li id="recurringbill" class="settings_li each_print_option"><i class="fas fa-print re_drp_icon"></i> Print Settings</li>
                    </ul>
                </div>
            </div>
            <div class="header_btn_wrap">
                <div class="header_btn_text">
                    <img src="https://beta.aipsoft.com/assets/images/export-icon.png">
                    <h6>Export</h6>
                </div>
                <div class="top-btn-dropdown">
                    <div class="header_btn"> <span><img src="https://beta.aipsoft.com/assets/images/arrow-bottom.png"></span>
                    </div>
                    <input type="hidden" name="gender">
                    <ul class="top-btn-dropdown-menu">
                        <li id="printcurrentpages" class="each_excel_button" data-type="current_page"><i class="fas fa-file-export re_drp_icon"></i> Export Excel - Current Page</li>
                        <li id="printcustomepages" class="each_excel_button" data-type="all_pages"><i class="fas fa-print re_drp_icon"></i> Export Excel - All Pages</li>
                        <li id="printallpages" class="botted-line each_pdf_button"><i class="fas fa-print re_drp_icon"></i> Export PDF - Current Page</li>
                        <li id="printallpages" class="botted-line each_pdf_button"><i class="fas fa-print re_drp_icon"></i> Export PDF - All Pages</li>
                        <li id="exportsettings" class="settings_li "><i class="fas fa-file-export re_drp_icon"></i> Export Settings</li>
                    </ul>
                </div>
            </div>
            <div class="header_btn_wrap">
                <div class="header_btn_text">
                    <img src="https://beta.aipsoft.com/assets/images/email.png">
                    <h6>Email</h6>
                </div>
                <div class="top-btn-dropdown">
                    <div class="header_btn" style="padding-bottom: 6px;"> <span><img src="https://beta.aipsoft.com/assets/images/arrow-bottom.png"></span>
                    </div>
                    <input type="hidden" name="gender">
                    <ul class="top-btn-dropdown-menu">
                        <li id="emailcurrentpages"><i class="far fa-envelope re_drp_icon"></i> Email - Current Page</li>
                        <li id="emailcustomepages"><i class="far fa-envelope re_drp_icon"></i> Email - Custom Pages</li>
                        <li id="emailallpages" class="botted-line"><i class="far fa-envelope re_drp_icon"></i> Email - All Pages</li>
                        <li id="scheduleemail"><i class="far fa-clock re_drp_icon"></i> Schedule Email</li>
                        <li id="emialsettings" class="settings_li"><i class="far fa-envelope re_drp_icon"></i> Email Settings</li>
                    </ul>
                </div>
            </div>
            <div class="top-btn-dropdown">
                <div onclick="on()" class="header_btn btn_report-pro report_properties" data-pd-popup-open="reportproperties" href="#">
                    <p>
                        <img src="https://beta.aipsoft.com/assets/images/SETTING.png">
                        <h6>Report Properties</h6> 
                    </p>
                </div>
            </div>
            
            <div class="top-btn-dropdown">
                <div onclick="on()" class="header_btn btn_report-pro" data-pd-popup-open="printpreference" href="#">
                    <p>
                        <img src="https://beta.aipsoft.com/assets/images/print_preference.png">
                        <h6>Print Prefernce</h6> 
                    </p>
                </div>
            </div>
            <!-- <div class="date_range_wrap">
                <p>Date Range</p>
                <div id="reportrange2" style="background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc; width: 100%; float: left;">
                    <img src="https://beta.aipsoft.com/assets/images/calender.png"> <span></span>  <i class="fa fa-caret-down"></i>
                </div>
            </div> -->
        </div>
                <!-- Main  Page -->
            <div id="main">
                <div class="main_section_body">
                    <div class="col-sm-12 col-lg-12 col-md-12 col-xs-12">
                        <div class="refresh_wrapper">
                            <!-- <input type="button" class="refresh_btn btn btn-primary" value="Refresh"> -->
                            <a class="refresh_report">
                                <i class="fa fa-refresh" aria-hidden="true"></i>
                            </a>
                        </div>
                        <div class="report_wrapper section_table table_fullwidth">
                            <div class="table_scrollbar">
                                <table class="table table-bordered dynamic_report_table">
                                    <thead class="dynamic_report_table_thead">
                                    </thead>
                                    <tbody class="dynamic_report_table_tbody">
                                     
                                    </tbody>
                                    <tfoot align="right" class="dynamic_report_table_tfoot invisibl">
                                        
                                    </tfoot>
                                </table>
                             </div>
                            <h4 class="closing_stock_h4"></h4>
                        </div>
                    </div>    
                </div>
                
                <!-- <div class="main_section_body">
                    <h4>Magnus</h4>
                    <h2>Sales By Order</h2>
                    <p>From 01 Jun 2020 To 30 Jun 2020</p>
                </div>
                <div class="section_table table_fullwidth">
                    <table class="">
                        <thead>
                          <tr>
                            <th class="sortable rc_color">NAME</th>
                            <th>INVOICE COUNT</th>
                            <th>SALES</th>
                            <th>SALES WITH TAX </th>
                          </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Althaf</td>
                                <td>Data 1</td>
                                <td>abc</td>
                                <td>1021.00</td>
                            </tr>
                            <tr>
                                <td>Haq</td>
                                <td>Data 2</td>
                                <td>abc</td>
                                <td>4541.00</td>
                            </tr>
                            <tr>
                                <td>Sayed</td>
                                <td>Data 3</td>
                                <td >abc</td>
                                <td>741.00</td>
                            </tr>
                        </tbody>
                    </table>
                </div> -->
            </div>
        </div>
                          <!-- Report properties -->
        <div id="" class="popup-position">
            <div  class="report-popup popup-position" data-pd-popup="reportproperties">
                <div class="popup-inner"> 
                    <a href="#" class="property_close_popup vendor_btnn" class="popup-close" data-pd-popup-close="reportproperties" href="#">×</a>
                    <h2>Report Properties </h2>
                    <div class="popup-tab-wrap row">
                        <div class="tab_height">
                            <div class="col-md-3 col-sm-3 col-xs-4">
                                <div class="left_tab">
                                    <ul class="nav nav-tabs report-tabs-left" role="tablist">
                                                                             <li role="presentation" class="active"><a href="#filters" aria-controls="filters" role="tab" data-toggle="tab">Filters</a>
                                        </li>
                                         
                                                                              <li role="presentation" class=""><a href="#customizecolumns" aria-controls="customizecolumns" role="tab" data-toggle="tab">Customize Columns</a>
                                    </ul>
                                </div>
                            </div>
                            <div class="col-md-9 col-sm-9 col-xs-8">
                                <div class="report_content">
                                    <div class="report-tab-content tab-content">
                                        <div role="tabpanel" class="tab-pane active" id="filters">
                                                                                                    <div class="popup-tab-daterange each_filter_settings"  data-substitute_from_date_with = "" data-substitute_value_with = ""  data-single_date_from_date = "0" data-single_date = "0"data-date_only="0" data-type="date" data-connected_to="IF(SI.id IS NOT NULL,TIMESTAMP(SI.billing_date,SI.billing_time),TIMESTAMP(O.billing_date,O.billing_time))" data-exclude_filter="0">
                                                            <p class="report_otion_lbl">Date Range</p>
                                                            <div id="reportrange3" style="background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc; width: 100%; float: left;">
                                                                <img src="https://beta.aipsoft.com/assets/images/calender.png"> <span></span>  <i class="fa fa-caret-down"></i>
                                                            </div>
                                                        </div>
                                                                                                        
                                                                                                        <div class="popuptab-select each_filter_settings" data-substitute_value_with = "" data-type="branch" data-connected_to="IF(SI.id IS NOT NULL,SI.branch_id,O.branch_id)">
                                                                <p class="report_otion_lbl">Branch</p>
                                                                                                                          
                                                                <!-- //------------------- fa report_enable_branch--------------------- -->
                                                                <select id="mounth" class="branch_id">
                                                                                                                                                    <option value="all_branches">All Branches</option>
                                                                                                                                                    <option value="1">AL FALAH</option>
                                                                                                                                                    <option value="2">MBZ</option>
                                                                                                                                                    <option value="3">Musaffah</option>
                                                                                                                                                                                                        </select>
                                                                <!-- //-------------------------------------------------------------------- -->

                                                            </div>
                                                                                                            
                                                                                                    <div class="popuptab-select each_filter_settings" data-substitute_value_with = "" data-data_type="string" data-type="multi_select" data-condition_type="IN" data-connected_to="IF(SI.id IS NOT NULL,SI.delivery_type_id,O.delivery_type_id)" data-exclude_in_sum="0" data-exclude_filter="0">
                                                                <p class="report_otion_lbl">Delivery Type</p>
                                                                <select class="filter_item multi_filter_item" data-connected_to="IF(SI.id IS NOT NULL,SI.delivery_type_id,O.delivery_type_id)" data-condition_type="IN" data-data_type="string" >
                                                                    <option value="" selected='selected'>All Delivery Type</option>
                                                                                                                                                                                                            <option value="1">PICKUP</option>
                                                                                                                                        <option value="2">Home Delivery</option>
                                                                                                                                                                                                                                                                            </select>
                                                            
                                                            </div>
                                                                                                        
                                                                                                    <div class="popuptab-select each_filter_settings" data-substitute_value_with = "" data-data_type="string" data-type="multi_select" data-condition_type="IN" data-connected_to="PHIST.linked_account_id" data-exclude_in_sum="0" data-exclude_filter="0">
                                                                <p class="report_otion_lbl">Payment Method</p>
                                                                <select class="filter_item multi_filter_item" data-connected_to="PHIST.linked_account_id" data-condition_type="IN" data-data_type="string" >
                                                                    <option value="" selected='selected'>All Payment Method</option>
                                                                                                                                                                                                            <option value="1">Cash Account</option>
                                                                                                                                        <option value="33777">Credit Card</option>
                                                                                                                                        <option value="34127">ADIB BANK</option>
                                                                                                                                        <option value="36456">Voucher</option>
                                                                                                                                        <option value="43382">petty cash-sanad</option>
                                                                                                                                                                                                                                                                            </select>
                                                            
                                                            </div>
                                                                                                        
                                                                                                        <div class="popuptab-select each_filter_settings" data-substitute_value_with = "" data-data_type="string" data-type="select" data-connected_to="SI.driver_id" data-exclude_in_sum="0" data-exclude_filter="0">
                                                                <p class="report_otion_lbl">Driver</p>
                                                                <select id="mounth" class="filter_item" data-connected_to="SI.driver_id" data-data_type="string" >
                                                                    <option value="" selected='selected'>All Driver</option>
                                                                                                                                                                                                            <option value="12">AMIN</option>
                                                                                                                                        <option value="16">mugahed</option>
                                                                                                                                        <option value="20">Fida Hus</option>
                                                                                                                                        <option value="21">HAPY</option>
                                                                                                                                                                                                                                                                            </select>
                                                            
                                                            </div>
                                                                                                        
                                                
                                                                                        
                                        </div>
                                        <div role="tabpanel" class="tab-pane " id="customizecolumns">
                                            <div class="col-md-5">
                                                <div class="customizecolumns_wrap">
                                                    <div class="availabe_module_wrp sel_wrap">
                                                        <div class="availabe_module">Selected Columns</div>
                                                        <div class="modules_padd">
                                                            <form id="custom-search-form" onsubmit="return false" class="form-search">
                                                                <div class="input-append ">
                                                                    <input type="text" class="search_style search_columns" placeholder="Search">
                                                                </div>
                                                            </form>
                                                            <div id="module-left-scrollbar" class="scrollbar">
                                                                <div class="panel-group selected_columns_list" id="accordion">
                                                                    <div class="panel model_panal">
                                                                        <div class="panel-default"></div>
                                                                        <div id="one" class="panel-collapse collapse in selected_columns_wrapper" aria-expanded="true" style="">
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "SI.id" data-column_order="1" style="margin: 0;"><i class="far fa-image"></i> SI Id</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "O.id" data-column_order="2" style="margin: 0;"><i class="far fa-image"></i> Ord Id</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "ref" data-column_order="3" style="margin: 0;"><i class="far fa-image"></i> Branch</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "invoice_billing_date" data-column_order="4" style="margin: 0;"><i class="far fa-image"></i> Invoice#</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "invoice_billing_time" data-column_order="5" style="margin: 0;"><i class="far fa-image"></i> Order#</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "order_billing_date" data-column_order="6" style="margin: 0;"><i class="far fa-image"></i> Ref#</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "order_billing_time" data-column_order="7" style="margin: 0;"><i class="far fa-image"></i> Billing Date</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "SI.done_by" data-column_order="8" style="margin: 0;"><i class="far fa-image"></i> Billing Time</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "O.done_by" data-column_order="9" style="margin: 0;"><i class="far fa-image"></i> Order Date</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "salesman" data-column_order="10" style="margin: 0;"><i class="far fa-image"></i> Order Time</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "cust_mobile" data-column_order="11" style="margin: 0;"><i class="far fa-image"></i> Invoiced Staff</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "cust_name" data-column_order="12" style="margin: 0;"><i class="far fa-image"></i> Ordered Staff</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "delivery_type" data-column_order="13" style="margin: 0;"><i class="far fa-image"></i> Salesman</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "gross_amount" data-column_order="14" style="margin: 0;"><i class="far fa-image"></i> Cust-Mobile</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "discount" data-column_order="15" style="margin: 0;"><i class="far fa-image"></i> Customer Name</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "tax_amount" data-column_order="16" style="margin: 0;"><i class="far fa-image"></i> Order Type</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "round_off" data-column_order="17" style="margin: 0;"><i class="far fa-image"></i> Gross Amount</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "vatable_amount" data-column_order="18" style="margin: 0;"><i class="far fa-image"></i> Discount</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "grand_total" data-column_order="19" style="margin: 0;"><i class="far fa-image"></i> VAT</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "paid_amount" data-column_order="20" style="margin: 0;"><i class="far fa-image"></i> Round Off</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "balance_amount" data-column_order="21" style="margin: 0;"><i class="far fa-image"></i> Vatable Amount</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "payment_info" data-column_order="22" style="margin: 0;"><i class="far fa-image"></i> Net Sale Amount</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "payment_info" data-column_order="23" style="margin: 0;"><i class="far fa-image"></i> Paid Amount</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "SI.invoice_remark2" data-column_order="24" style="margin: 0;"><i class="far fa-image"></i> Balance</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "order_status" data-column_order="25" style="margin: 0;"><i class="far fa-image"></i> Payment Info</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "driver_name" data-column_order="26" style="margin: 0;"><i class="far fa-image"></i> Payment</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "driver_name" data-column_order="27" style="margin: 0;"><i class="far fa-image"></i> Remark</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "driver_name" data-column_order="28" style="margin: 0;"><i class="far fa-image"></i> Status</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                                                                                                            <div class="sub_item  ">
                                                                                    <p  data-column_identifier= "driver_name" data-column_order="29" style="margin: 0;"><i class="far fa-image"></i> Driver</p>
                                                                                    <input type="text" name="col_width" value="3.1%" class="table_col_width form-control">
                                                                                </div>
                                                                             
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <!--  <div class="total_price">Total : 5000.00 AED</div> --></div>
                                                </div>
                                            </div>
                                            <div class="col-md-2 col-sm-2">
                                                <div class="module_button_wrp">
                                                    <button type="button" class="module_button move_to_removed"><i class="fas fa-chevron-right"></i>
                                                    </button>
                                                    <button type="button" class="module_button remove_from_removed"><i class="fas fa-chevron-left"></i>
                                                    </button>
                                                    <button type="button" class="module_button_double move_to_removed_full"><i class="fas fa-angle-double-right"></i>
                                                    </button>
                                                    <button type="button" class="module_button_double remove_from_removed_full"><i class="fas fa-angle-double-left"></i>
                                                    </button>
                                                    <button type="button" class="reset_button">Reset</button>
                                                </div>
                                            </div>
                                            <div class="col-md-5">
                                                <div class="customizecolumns_wrap">
                                                    <div class="availabe_module_wrp rem_wrap">
                                                        <div class="availabe_module">Removed Columns</div>
                                                        <div class="modules_padd">
                                                            <form id="custom-search-form1"  onsubmit="return false" class="form-search">
                                                                <div class="input-append ">
                                                                    <input type="text" class="search_columns search_style" placeholder="Search">
                                                                </div>
                                                            </form>
                                                            <div id="module-left-scrollbar" class="scrollbar">
                                                                <div class="panel-group removed_columns_list" id="accordion">
                                                                    <div class="panel model_panal">
                                                                        <div class="panel-default"></div>
                                                                        <div id="one" class="removed_columns_wrapper panel-collapse collapse in" aria-expanded="true" style="">
                                                                            <!-- <div class="sub_item">
                                                                                <p style="margin: 0;"><i class="far fa-image"></i> POS</p><span>abc</span>
                                                                            </div>
                                                                            <div class="sub_item">
                                                                                <p style="margin: 0;"><i class="far fa-image"></i> invoiceing</p><span>abc</span>
                                                                            </div>
                                                                            <div class="sub_item">
                                                                                <p style="margin: 0;"><i class="far fa-image"></i> invoiceing</p><span>abc</span>
                                                                            </div> -->
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <!--  <div class="total_price">Total : 5000.00 AED</div> --></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div role="tabpanel" class="tab-pane" id="grouprows">
                                            <div class="col-md-5">
                                                <div class="customizecolumns_wrap">
                                                    <div class="availabe_module_wrp">
                                                        <div class="availabe_module">Available Columns</div>
                                                        <div class="modules_padd">
                                                            <form id="custom-search-form2"  onsubmit="return false" class="form-search">
                                                                <div class="input-append ">
                                                                    <input type="text" class="search_style" placeholder="Search">
                                                                </div>
                                                            </form>
                                                            <div id="module-left-scrollbar" class="scrollbar">
                                                                <div class="panel-group" id="accordion">
                                                                    <div class="panel model_panal">
                                                                        <div class="panel-default"></div>
                                                                        <div id="one" class="panel-collapse collapse in" aria-expanded="true" style="">
                                                                            <div class="sub_item">
                                                                                <p style="margin: 0;"><i class="far fa-image"></i> POS</p><span>abc</span>
                                                                            </div>
                                                                            <div class="sub_item">
                                                                                <p style="margin: 0;"><i class="far fa-image"></i> invoiceing</p><span>abc</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <!--  <div class="total_price">Total : 5000.00 AED</div> --></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div role="tabpanel" class="tab-pane" id="graph">
                                            <img src="https://beta.aipsoft.com/assets/images/example-graph.png">
                                        </div>
                                        <div role="tabpanel" class="tab-pane" id="savedproperties">
                                            <div class="savedproperties_wrap">
                                                <label class="savedpro-checkbox">
                                                    <p>With Product Service Details</p>
                                                    <h6>Saved on 17th March 2020,Abdul Haq</h6> 
                                                    <input type="radio" name="radio"><span class="savepro-checkmark"></span>
                                                </label>
                                                <h4><a href="">Add to report home page</a></h4>
                                            </div>
                                            <div class="savedproperties_wrap">
                                                <label class="savedpro-checkbox">
                                                    <p>With Product Service Details</p>
                                                    <h6>Saved on 17th March 2020,Abdul Haq</h6> 
                                                    <input type="radio" name="radio"><span class="savepro-checkmark"></span>
                                                </label>
                                                <h4><a href="">Add to report home page</a></h4>
                                            </div>
                                            <div class="savedproperties_wrap">
                                                <label class="savedpro-checkbox">
                                                    <p>With Product Service Details</p>
                                                    <h6>Saved on 17th March 2020,Abdul Haq</h6> 
                                                    <input type="radio" name="radio"><span class="savepro-checkmark"></span>
                                                </label>
                                                <h4><a href="">Add to report home page</a></h4>
                                            </div>
                                            <div class="savedproperties_wrap">
                                                <label class="savedpro-checkbox">
                                                    <p>With Product Service Details</p>
                                                    <h6>Saved on 17th March 2020,Abdul Haq</h6> 
                                                    <input type="radio" name="radio"><span class="savepro-checkmark"></span>
                                                </label>
                                                <h4><a href="">Add to report home page</a></h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="tab_footer_wrap">
                        <div class="tab_footer">
                            <button type="button" class="report-submit_btn submit_report">Submit Report</button>
                           <!--  <button type="button" class="report-submitsavepro_btn">Submit & Save Properties</button>
                            <button type="button" class="report-submitsaveaspro_btn">Submit & Save As Properties</button>  -->
                            <a href="#" class="report-cancel-btn">Cancel</a> 
                        </div>
                    </div>
                </div>
            </div>
        </div>
          <div id="" class="popup-position">
            <div class="report-popup popup-position" data-pd-popup="printpreference" >
                <div class="popup-inner printp_inner"> 
                <a href="#" class="property_close_popup vendor_btnn" class="popup-close" data-pd-popup-close="printpreference" href="#">×</a>
                    <div class="print_preference">    
                        <p>Print Preference</p>
                    </div>
                    <div class="box_wrap">
                       <!--  <div class="col-md-4">
                            <div class="preview_wrap">
                                <h4>Preview</h4>
                                <div class="priview_box">
                                    <p>Lafraska cafe</p>
                                    <h6>Basic : Accrual</h6>
                                    <ul class="shopdetailsul">
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                    </ul>

                                    <ul class="priview_footer_text">
                                        <li>Raheemkp 2010</li>
                                        <li>Page 1 of 1</li>
                                        <li>11 Jun 2020 10:00 PM</li>
                                    </ul>
                                </div>
                            </div>
                        </div> -->
                        <div class="col-md-8">
                            <div class="print_pre_form">
                                <div class="col-md-12 col-xs-12">
                                    <div class="col-md-3 col-sm-3 col-xs-12">
                                        <label>Select Font</label>
                                        <div class="selection_dropdown fonts_list_wrapper" id="tabledensity">
                                        </div>
                                    </div>   
                                    <div class="col-md-2 col-sm-2 col-xs-12">                                 
                                        <label>Font Size</label>    
                                        <div class="selection_dropdown" id="tabledensity1">
                                            <i class="fas fa-sort-down selection_icon"></i>
                                            <span class="font_size_span">8</span>
                                            <ul class="drop">
                                                <li><a>5</a></li>
                                                <li><a>6</a></li>
                                                <li><a>7</a></li>
                                                <li class="selected"><a>8</a></li>
                                                <li><a>10</a></li>
                                                <li><a>11</a></li>
                                                <li><a>12</a></li>
                                                <li><a>13</a></li>
                                                <li><a>14</a></li>
                                                <li><a>15</a></li>
                                                <li><a>16</a></li>
                                                <li><a>17</a></li>
                                                <li><a>18</a></li>
                                            </ul>
                                        </div>    
                                    </div>
                                    <div class="col-md-2 col-sm-2 col-xs-12">
                                        <label>Tbl Brdr Clr</label>    
                                        <div id="color-picker" class="">
                                            <div class="wrapper-dropdown">
                                                <span class="click_span"><span class="desti_span" style="background: #F7941D"><i class="fas fa-sort-down selection_icon"></i></span> </span>
                                                <ul class="dropdown invisbl">
                                                    <li class="each_color" data-color="#00759A"><span style="background-color: #00759A;"></span></li>
                                                    <li class="each_color" data-color="#F7941D"><span style="background-color: #F7941D;"></span></li>
                                                    <li class="each_color" data-color="#A71930"><span style="background-color: #A71930;"></span></li>
                                                    <li class="each_color" data-color="#000"><span style="background-color: #000;"></span></li>
                                                </ul>
                                            </div>
                                        </div>   
                                    </div>  
                                    <div class="col-md-2 col-sm-2 col-xs-12">
                                        <label>Tbl Brdr Width</label>    
                                        <div class="selection_dropdown" id="tabledensity2">
                                            <i class="fas fa-sort-down selection_icon"></i>
                                            <span class="border_width_span">0.5px</span>
                                            <ul class="drop border_drop">
                                                <li><a>0.5px</a></li>
                                                <li class="selected"><a>1px</a></li>
                                            </ul>
                                        </div>      
                                    </div>  
                                    <div class="col-md-2 col-sm-2 col-xs-12">
                                        <label>Tbl Padding</label>    
                                        <div class="selection_dropdown" id="tabledensity3">
                                            <i class="fas fa-sort-down selection_icon"></i>
                                            <span class="tbl_padding_span">5</span>
                                            <ul class="drop padding_drop">
                                                <li><a>1</a></li>
                                                <li><a>2</a></li>
                                                <li><a>3</a></li>
                                                <li><a>4</a></li>
                                                <li class="selected"><a>5</a></li>
                                            </ul>
                                        </div>      
                                    </div>  
                                </div>
                                
                                <!-- <div class="col-md-6">
                                    <label>Table Design</label>
                                    <div class="selection_dropdown" id="tabledesign">
                                        <i class="fas fa-sort-down selection_icon"></i>
                                            <span>Defualt</span>
                                        <ul class="drop">
                                            <li class="selected"><a>Defualt</a></li>
                                            <li><a href="">Defualt</a></li>
                                            <li><a href="">Defualt</a></li>
                                            <li><a href="">Defualt</a></li>
                                        </ul>
                                    </div>
                                </div> -->
                            </div>

                            <div class="choose_details_wrap">
                                <h4>Choose Details to display</h4>
                                <ul>
                                    <li>
                                        <label class="custom_check"><p>Organization Name</p>
                                          <input type="checkbox" data-identi="org_name" class="display_details" checked="checked">
                                          <span class="custom_checkmark"></span>
                                        </label>
                                    </li>                                    
                                    <li>
                                        <label class="custom_check"><p>Report Name</p>
                                          <input type="checkbox" data-identi="report_name" class="display_details" checked="checked">
                                          <span class="custom_checkmark"></span>
                                        </label>
                                    </li>                                    
                                    <li>
                                        <label class="custom_check"><p>Page Number</p>
                                          <input type="checkbox" data-identi="page_number" class="display_details" checked="checked">
                                          <span class="custom_checkmark"></span>
                                        </label>
                                    </li>                                    
                                    <li>
                                        <label class="custom_check"><p>Genarated By</p>
                                          <input type="checkbox" data-identi="generated_by" class="display_details" checked="checked">
                                          <span class="custom_checkmark"></span>
                                        </label>
                                    </li>                                    
                                    <li>
                                        <label class="custom_check"><p>Genarated Date</p>
                                          <input type="checkbox" data-identi="generated_date" class="display_details" checked="checked">
                                          <span class="custom_checkmark"></span>
                                        </label>
                                    </li>                                    
                                    <li>
                                        <label class="custom_check"><p>Genarated Time</p>
                                          <input type="checkbox" data-identi="generated_time" class="display_details" checked="checked">
                                          <span class="custom_checkmark"></span>
                                        </label>
                                    </li>
                                    <li>
                                        <label class="custom_check"><p>Table Header in All Pages</p>
                                          <input type="checkbox" data-identi="tbl_hrd" class="display_details" checked="checked">
                                          <span class="custom_checkmark"></span>
                                        </label>
                                    </li>
                                    <li>
                                        <label class="custom_check"><p>Alt. Color for the table Rows</p>
                                          <input type="checkbox" data-identi="alt_clr" class="display_details" checked="checked">
                                          <span class="custom_checkmark"></span>
                                        </label>
                                    </li>
                                    <li>
                                        <label class="custom_check"><p>Display Border for the Table</p>
                                          <input type="checkbox" data-identi="show_border" class="display_details" checked="checked">
                                          <span class="custom_checkmark"></span>
                                        </label>
                                    </li>
                                    <li>
                                        <label class="custom_check"><p>Display Letter Header in PDF</p>
                                          <input type="checkbox" data-identi="letter_header" class="display_details" checked="checked">
                                          <span class="custom_checkmark"></span>
                                        </label>
                                    </li>
                                    <li>
                                        <label class="custom_check"><p>Display Letter Footer in PDF</p>
                                          <input type="checkbox" data-identi="letter_footer" class="display_details" checked="checked">
                                          <span class="custom_checkmark"></span>
                                        </label>
                                    </li>
                                    <li>
                                        <label class="custom_check"><p>Display Filter Options</p>
                                          <input type="checkbox" data-identi="filter_option" class="display_details" checked="checked">
                                          <span class="custom_checkmark"></span>
                                        </label>
                                    </li>
                                </ul>
                            </div>

                            <hr class="break_border">

                            <div class="radio_btn_div">
                                <div class="radio_width">
                                    <h5>Paper Size</h5>
                                    <label class="radio_btn"><p>A4</p>
                                      <input type="radio" checked="checked" class="paper_size" data-size="A4" name="paper_size">
                                      <span class="radio_checkmark"></span>                                  
                                    </label>
                                    <label class="radio_btn"><p>LETTER</p>
                                      <input type="radio" name="paper_size" class="paper_size" data-size="LETTER" >
                                      <span class="radio_checkmark"></span>
                                    </label>      
                                </div>                                
                                <div class="radio_width">
                                    <h5>Orientation</h5>
                                    <label class="radio_btn"><p>Portrait</p>
                                      <input type="radio" checked="checked" data-orientation="P" class="page_orientation" name="page_orientation">
                                      <span class="radio_checkmark"></span>                                  
                                    </label>
                                    <label class="radio_btn"><p>Landscape</p>
                                      <input type="radio" name="page_orientation" data-orientation="L" class="page_orientation">
                                      <span class="radio_checkmark"></span>
                                    </label>      
                                </div>                              
                            </div>
                            <div class="margins_div">
                                <ul>
                                    <li>
                                        <input type="" class="top_margin" name="" value="40">
                                        <p>Top</p>
                                    </li>                                    
                                    <li>
                                        <input type="" class="bottom_margin" name="" value="40">
                                        <p>Bottom</p>
                                    </li>                                    
                                    <li>
                                        <input type="" class="left_margin" name="" value="10">
                                        <p>Left</p>
                                    </li>                                    
                                    <li>
                                        <input type="" class="right_margin" name="" value="10">
                                        <p>Right</p>
                                    </li>
                                </ul>
                            </div>

                        </div>
                    </div>
                                                <div class="note">
                                <p>Note : The changes made here will be application only for print</p>
                            </div>
                    <div class="preview_footer_btn">
                        <button type="button" class="preview_btn">OK</button>
                        <button type="button" class="cancel_btn">Cancel</button>
                    </div>
                </div>
            </div>
        </div>        <!-- End Report properties -->
<script type="text/javascript">
function on()
{
    // document.getElementById("overlay").style.display = "block";
}
function off()
{
    // document.getElementById("overlay").style.display = "none";
}
function openNav()
{
    document.getElementById("mySidenav").style.width = "300px";
    document.getElementById("main").style.marginLeft = "300px";
}
    
                /* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
function closeNav()
{
  document.getElementById("mySidenav").style.width = "0";
  document.getElementById("main").style.marginLeft = "0";
}
var column_for_sort = [];
$(function(){
    var print_preferences = {};
    let display_details = [];
    // $(".pdf_drag").draggable();
    let rgbToHex = function(r, g, b)
    {
     r = $.trim(r);
     g = $.trim(g);
     b = $.trim(b);
     var rgb = b | (g << 8) | (r << 16);
        return '#' + (0x1000000 + rgb).toString(16).slice(1)
    }
    $(".click_span").click(function(){
        $(".dropdown").toggleClass('invisbl');
    });
     $("body").on("click",".report-cancel-btn",function(){
        $('.property_close_popup').trigger('click');
    });
    $(".each_color").click(function(){
        let color = $(this).data('color');
        $(".dropdown").toggleClass('invisbl');
        $(".desti_span").css('background',color);
    });
    $(".direct_print").click(function(){
        $(".each_print_option").eq(0).trigger('click');
    });
    $(".cancel_btn").click(function(){
        $(".property_close_popup.vendor_btnn").trigger('click');
    });
    $(".preview_btn").click(function(){
        display_details = [];
        $(".display_details").each(function(){
            // console.log($(this).data('identi'));
            if($(this).is(":checked"))
            {
                display_details.push($(this).data('identi'));
            }
        });
        let paper_size       = $(".paper_size:checked").data('size');
        let page_orientation = $(".page_orientation:checked").data('orientation');
        let font             = $(".selection_icon_span").text();
        let font_size        = $(".font_size_span").text();
        let margins          = [$(".top_margin").val(),$(".right_margin").val(),$('.bottom_margin').val(),$(".left_margin").val()];
        let border_color     = $(".desti_span").css("background-color");
        print_preferences['display_details']  = display_details;
        print_preferences['page_orientation'] = page_orientation;
        print_preferences['paper_size']       = paper_size;
        print_preferences['font']             = font;
         print_preferences['font_size']       = font_size;
        print_preferences['margins']          = margins;
        let ab = border_color.split("rgb");
        ab = ab[1].substring(1, ab[1].length-1);
        ab = ab.split(",");
        border_color = rgbToHex(ab[0],ab[1],ab[2]);
        print_preferences['border_color']     = border_color;
        // console.log(display_details);
        // console.log(page_orientation);
        // console.log(paper_size);
        // console.log(font);
        // console.log(margins);
        $(".property_close_popup.vendor_btnn").trigger('click');
    });
    
    $.ajax({
        url      : base_url + "pdf_generate/getFontNames",
        data     : {},
        type     : "POST",
        dataType : 'JSON',
        success  : function(fonts)
        {
            //console.log(fonts);
            $(".fonts_list_wrapper").empty();
            $(".fonts_list_wrapper").append('<i class="fas fa-sort-down selection_icon"></i><span class = "selection_icon_span"></span><ul class="drop font_list"></ul>');
            let default_font = "helvetica";
            // console.log($("body").data('font_name'));
            $.each(fonts,function(index,font){
                // console.log('default_font');
                // console.log($("body").data('font_name'));
                if(font == $("body").data('font_name'))
                    $(".font_list").append('<li class ="selected"><a href="">'+font+'</a></li>');
                else if(font == default_font && ($("body").data('font_name') == "" || $("body").data('font_name') == undefined))
                    $(".font_list").append('<li class ="selected"><a href="">'+font+'</a></li>');
                else
                    $(".font_list").append('<li><a href="">'+font+'</a></li>');
            });
            if($("body").data('font_name') == "" || $("body").data('font_name') == undefined)
                $("span.selection_icon_span").html(default_font);
            else
                $("span.selection_icon_span").html($("body").data('font_name'));
            let dd1 = new DropDown($('#tabledensity'));
        }
    });        
    function DropDown(el) {
        this.dd = el;
        this.placeholder = this.dd.children('span');
        this.opts = this.dd.find('ul.drop li');
        this.val = '';
        this.index = -1;
        this.initEvents();
    }

    DropDown.prototype = {
        initEvents: function () {
            var obj = this;
            obj.dd.on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).toggleClass('active');
            });
            obj.opts.on('click', function () {
                var opt = $(this);
                obj.val = opt.text();
                obj.index = opt.index();
                obj.placeholder.text(obj.val);
                opt.siblings().removeClass('selected');
                opt.filter(':contains("' + obj.val + '")').addClass('selected');
            }).change();
        },
        getValue: function () {
            return this.val;
        },
        getIndex: function () {
            return this.index;
        }
    };
    let dd4 = new DropDown($('#tabledensity3'));
    let dd3 = new DropDown($('#tabledensity2'));
    let dd2 = new DropDown($('#tabledensity1'));
    $(document).click(function () {
        $('.selection_dropdown').removeClass('active');
    });
    $(document).click(function(e){  
        if(!$(e.target).is(".each_pdf_button") && !$(e.target).is(".pdf_print_btn") && !$(e.target).is(".pdf_wraper"))
        {
            $("#pdf_holder").addClass('invisibl');
            $(".pdf_wraper").addClass('invisibl');
            $("#pdf_holder").empty();
            // console.log('I am called click');
        }
        if(!$(e.target).is("#toggleMenu"))
        {
            let cl = $('#toggleMenu').data('clicks');
            // console.log(cl);
            if(cl)
            {
                closeNav();
                $('#toggleMenu').data("clicks", false);
            }    
        }
    });
    function myPrint(){
        printJS($(this).data('pdf_url'));
        // console.log($(this).data('pdf_url'));
    }
    $('.pdf_print_btn').click(myPrint);
    let printFunction = function(index,download)
    {
        $(".main_section_body").addClass('skeleton');
        let search       = $('input[type="search"]').val();
        let current_page = $(".paginate_button.active").text();
        let report_name  = 'unpaid_sales_invoices';
        let branch_id    = $("select.branch_id").val();
        let start        = "";
        let length       = "";
        let page_length  = $("select.input-sm").val();
        let total_pages  = "";
        let max_page     = "";
        let summable_column_tr = "";
        let thead_arr = [];
        let tfoot_arr = [];
        // console.log(summable_column_span);
        // return false;
        if(index == 0) 
        {
            start        = Number(current_page) - 1;
            length       = page_length;
            if($(".dynamic_report_table_tfoot").length > 0 && !$(".dynamic_report_table_tfoot").hasClass('invisibl'))
            {
                $(".dynamic_report_table_tfoot").find('th').css('color','red');
                summable_column_tr = $(".dynamic_report_table_tfoot").html();
                $(".dynamic_report_table_tfoot").find('th').css('color','#565a7e');
                $(".dynamic_report_table_tfoot").find('th').each(function(index){
                    thead_arr.push($(".dynamic_report_table_thead").find('th').eq(index).text());
                    tfoot_arr.push($(this).text());
                });
            }
        }
        else if(index == 1)
        {
            $(".dynamic_report_table_tfoot").find('th').css('color','red');
            summable_column_tr = ($(".dynamic_report_table_tfoot").length > 0) ? $(".dynamic_report_table_tfoot").html() : "";
            total_pages = $(".paginate_button").eq($(".paginate_button").length - 3).text();
            start  = 0;
            length = Number(total_pages) * Number(page_length);
            $(".dynamic_report_table_tfoot").find('th').css('color','#565a7e');
            $(".dynamic_report_table_tfoot").find('th').each(function(index){
                thead_arr.push($(".dynamic_report_table_thead").find('th').eq(index).text());
                tfoot_arr.push($(this).text());
            });
        }
            console.log(thead_arr);
            console.log(tfoot_arr);
        // console.log(summable_column_tr);
        // return false;
        // console.log("start - "+start);
        // console.log("length - "+length);
        // let range        = $(".range_span").text();
        // let report_range = '(Range - '+range+')';
        let report_name_txt = $(".dynamic_report_name").text();
        let filter_setings_data  = [];
        let pred_date = "";
        let filter_names = [];
        let filter_identifier = "";
        let exclude_in_sum = ''; 
        let exclude_filter = '';
        $(".each_filter_settings").each(function(){
            filter_identifier = $(this).find('p.report_otion_lbl').text();
            switch($(this).data('type'))
            {
                case 'date':
                    let date = "";
                    let date_only = $(this).data('date_only');
                    exclude_filter = $(this).data('exclude_filter');
                    if(from_settings == 1)
                        date = $('#reportrange3 span').text();
                    // else if(from_settings == 0)
                    //    date  = $('#reportrange2 span').text();
                    else
                       date  = $(".range_span").text();
                        let date_split = date.split(" to ");
                        let from_date = "";
                        let from_time = "";
                        let to_date   = "";
                        let to_time   = "";
                        if(date_split.length == 2)
                        {
                            from_date = date_split[0].substring(0,date_split[0].indexOf(" "));
                            from_time = date_split[0].substring(date_split[0].indexOf(" "));
                            to_date   = date_split[1].substring(0,date_split[0].indexOf(" "));
                            to_time   = date_split[1].substring(date_split[0].indexOf(" "));
                            from_date = from_date.trim();
                            from_time = from_time.trim();
                            to_date   = to_date.trim();
                            to_time   = to_time.trim();
                        }
                        if(date_only == 1)
                        {
                            to_time  = "";
                            from_time = "";
                            // console.log('I am insede');
                        }
                        let index_found = date_format.indexOf('-');
                        if(index_found == -1)
                        {
                            index_found = date_format.indexOf('/');
                        }
                        // console.log(from_date);

                        let date_divider = date_format.substring(index_found, index_found+1);
                        let from_date_temp = from_date.split(date_divider);
                        let to_date_temp   = to_date.split(date_divider);
                        to_date   = to_date_temp[2]+"-"+to_date_temp[1]+"-"+to_date_temp[0];
                        from_date = from_date_temp[2]+"-"+from_date_temp[1]+"-"+from_date_temp[0];
                        pred_date  = ($('#reportrange3').data('daterangepicker').chosenLabel);
                        console.log(pred_date);
                        filter_setings_data.push({'selected_value':pred_date,'filter_type':'date','from_date':from_date,'from_time':from_time,'to_date':to_date,'to_time':to_time,'connected_to':$(this).data('connected_to'), 'exclude_filter':exclude_filter});
                        filter_names.push({'selected_value':from_date + " "+from_time+" to "+to_date+" "+to_time,'filter_name':filter_identifier});
                break;
                case 'select':
                    exclude_in_sum = $(this).data('exclude_in_sum');
                    exclude_filter = $(this).data('exclude_filter');
                    filter_setings_data.push({'filter_type':'select','selected_value' : $(this).find(".filter_item").val(),'connected_to' : $(this).data('connected_to'),'data_type':$(this).data('data_type'),'exclude_in_sum': exclude_in_sum,'exclude_filter': exclude_filter});
                    filter_names.push({'selected_value':$(this).next(".select-styled").html(),'filter_name':filter_identifier,'exclude_in_sum':exclude_in_sum, 'exclude_filter':exclude_filter});
                break;
                //TODO ///
                case 'multi_select':
                    exclude_in_sum = $(this).data('exclude_in_sum');
                    exclude_filter = $(this).data('exclude_filter');
                    filter_setings_data.push({'filter_type':'multi_select','selected_value' : $(this).find(".multi_filter_item").val(),'connected_to' : $(this).data('connected_to'),'data_type':$(this).data('data_type'),'condition_type':$(this).data('condition_type'),'exclude_in_sum':exclude_in_sum, 'exclude_filter':$(this).data('exclude_filter')});
                    filter_names.push({'selected_value':$(this).next(".select-styled").html(),'filter_name':filter_identifier,'exclude_in_sum':exclude_in_sum, 'exclude_filter':exclude_filter});
                break;
                case 'textbox':
                    let partial = $(this).data('partial');
                    exclude_in_sum = $(this).data('exclude_in_sum');
                    exclude_filter = $(this).data('exclude_filter');
                    let identifier_value = $(this).data('identifier_value');
                    filter_setings_data.push({'filter_type':'textbox','selected_text' : $(this).find(".filter_item").val(),'selected_value' : $(this).find(".filter_item").data('selected_value'),'connected_to' : $(this).data('connected_to'),'data_type':$(this).data('data_type'),'partial':partial,'exclude_in_sum':exclude_in_sum});
                    filter_names.push({'selected_value':$(this).find(".filter_item").val(),'filter_name':filter_identifier,'identifier_value':identifier_value,'exclude_in_sum':exclude_in_sum,'condition':$(this).find(".filter_item").data('condition'), 'exclude_filter':exclude_filter});
                break;
                case 'branch':
                    filter_setings_data.push({'filter_type':'branch','selected_value' : $(".branch_id").val(),'connected_to':$(this).data('connected_to')});
                    filter_names.push({'selected_value':$(this).find(".select-styled").html(),'filter_name':filter_identifier});
                break;
                case 'checkbox':
                    let checked = $(this).find(".filter_item").is(":checked") ? "1" : "0";
                    filter_setings_data.push({'filter_type':'checkbox','selected_value' : checked,'connected_to':$(this).data('connected_to'),'condition':$(this).find(".filter_item").data('condition')});
                break;
            }
        });
        let col_width_list = [];
        let col_width_name_list = [];
        $(".selected_columns_wrapper .sub_item p").each(function(){
            col_width = $(this).next('.table_col_width').val();
            avaliable_column_name = $(this).text();
            avaliable_column_name = $.trim(avaliable_column_name);
            perc_avail = col_width.substring(col_width.length-1);
            if(perc_avail != "%")
            {
                col_width = col_width + "%";
            }
            col_width_list.push(col_width);
            col_width_name_list.push(avaliable_column_name);
            // let obj = {};
            // avaliable_column_name = avaliable_column_name.split(' ').join('%');
            // obj[avaliable_column_name] = col_width;
            // col_width_list.push(obj);
            // col_width_list[avaliable_column_name] = col_width;
        });
        console.log(filter_names);
        //return false;
        console.log(col_width_list);
        // return false;
        let removed_column_list  = [];
        let removed_column_index = [];
        let table_heading_data   = [];
        $(".dynamic_report_table_thead tr th").each(function(){
            table_heading_data.push($(this).text());
        });
        console.log(table_heading_data);
        // return false;
        $(".removed_columns_wrapper .sub_item p").each(function(){
            removed_column_name = $(this).text();
            removed_column_name = $.trim(removed_column_name);
            removed_column_list.push(removed_column_name);
            removed_column_index.push($(this).data('column_order'));
        });
        console.log(filter_setings_data);
        console.log(filter_names);
        let grouping_column_index = $("body").data('grouping_column_index');

        // return false;
        // let col_width_list_wrapper = [];
        // col_width_list_wrapper.push(col_width_list);
        if(start < 0 ) start = 0;
        let ajax_data = {'report_type': 'dynamic_report','report_name':report_name,'report_name_txt':report_name_txt,'predefined_date':pred_date,'removed_column_list':removed_column_list,'removed_column_index':removed_column_index,'table_heading_data':table_heading_data,'filter_setings_data':filter_setings_data,'start':start,
            'length':length,'print_preferences' : print_preferences,'summable_column':summable_column_tr,'search':search,'selected_pdf_template' : 'BASIC_TEMPLATE_REPORT','col_width_list':col_width_list,'col_width_name_list':col_width_name_list,'thead_arr':thead_arr,'tfoot_arr':tfoot_arr,'filter_names':filter_names,'column_for_sort':column_for_sort}
        if(grouping_column_index != undefined && grouping_column_index != null && grouping_column_index != "")    
            ajax_data.grouping_column_index = grouping_column_index;
        // console.log(ajax_data);
        // return false;
        let scr = $("body").data('sort_column_return');
        if(scr[0] != "0" &&  scr[0] != 0)
        {
            let order_dt ={};
            order_dt[0] = {};
            order_dt[0]['column'] = scr[0];
            order_dt[0]['dir']    = scr[1];
            ajax_data['order'] = order_dt;
            console.log(order_dt);
            console.log(ajax_data);
            //return false;
        }
        // console.log(scr[0]);
        // return false;
        if(download == 1)
        {
            $.ajax({
                url      : base_url + "pdf_generate",
                data     : ajax_data,
                type     : "POST",
                success  : function(pdf_url)
                {
                    console.log(pdf_url);
                    pdf_url = $.trim(pdf_url);
                    let a=document.createElement('a');
                    var att = document.createAttribute("download");
                    a.target='_blank';
                    a.setAttributeNode(att);     
                    a.href=pdf_url;
                    a.click();
                    $(".main_section_body").removeClass('skeleton');
                }
            });   
        }
        else
        {
            $.ajax({
                url      : base_url + "pdf_generate",
                data     : ajax_data,
                type     : "POST",
                success  : function(pdf_url)
                {
                    console.log(pdf_url);
                    pdf_url = $.trim(pdf_url);
                    console.log(pdf_url);
                    PDFObject.embed(pdf_url, "#pdf_holder");
                    $("#pdf_holder").removeClass('invisibl');
                    $(".pdf_wraper").removeClass('invisibl');
                    $(".pdf_print_btn").data('pdf_url',pdf_url);
                    $(".each_print_option").eq(0).removeClass('selected');
                    $('.top-btn-dropdown-menu').slideUp(300);
                    setTimeout(function(){
                       $('.top-btn-dropdown-menu').slideUp(300);
                    },500);
                    $(".main_section_body").removeClass('skeleton');
                    // let a=document.createElement('a');
                    // a.target='_blank';
                    // a.href=data;
                    // a.click();
                }
            });    
        }
    }
    $('.multi_filter_item').select2({
        'multiple': true,
    });  
    $(".each_pdf_button").click(function(e){
        let index = $(".each_pdf_button").index($(this));
        printFunction(index,1);
    });   
    $('#toggleMenu').click(function(e)
    {
      e.stopPropagation()  ;
      var clicks = $(this).data('clicks');
      if (clicks) {
         closeNav();
      } else {
         openNav();
      }
      $(this).data("clicks", !clicks);
    });
    $('.top-btn-dropdown').click(function () {
        $(this).attr('tabindex', 1).focus();
        $(this).toggleClass('active');
        $(this).find('.top-btn-dropdown-menu').slideToggle(300);
    });
    $('.top-btn-dropdown').focusout(function () {
        $(this).removeClass('active');
        $(this).find('.top-btn-dropdown-menu').slideUp(300);
    });
    $('.top-btn-dropdown .top-btn-dropdown li').click(function () {
        $(this).parents('.top-btn-dropdown').find('span').text($(this).text());
        $(this).parents('.top-btn-dropdown').find('input').attr('value', $(this).attr('id'));
    });
    /*End Dropdown Menu*/
    $('.top-btn-dropdown-menu li').click(function () {
      var input = '<strong>' + $(this).parents('.top-btn-dropdown').find('input').val() + '</strong>',
          msg = '<span class="msg">Hidden input value: ';
      $('.msg').html(msg + input + '</span>');
    });
    $("[data-pd-popup-open]").on("click", function(e) {
        let targeted_popup_class = $(this).attr("data-pd-popup-open");
        $('[data-pd-popup="' + targeted_popup_class + '"]').fadeIn(100);
        $("body").addClass("popup-open");
        e.preventDefault();
    });
    //----- CLOSE
    $("[data-pd-popup-close]").on("click", function(e) {
        let targeted_popup_class = $(this).attr("data-pd-popup-close");
        $('[data-pd-popup="' + targeted_popup_class + '"]').fadeOut(200);
        $("body").removeClass("popup-open");
        e.preventDefault();
    });
    $('select').each(function(){
        if(!$(this).hasClass('multi_filter_item'))
        {
            let $this = $(this), numberOfOptions = $(this).children('option').length;
            $this.addClass('select-hidden'); 
            $this.wrap('<div class="select"></div>');
            $this.after('<div class="select-styled"></div>');
            let $styledSelect = $this.next('div.select-styled');
            $styledSelect.text($this.children('option').eq(0).text());
            let $list = $('<ul />', {
                'class': 'select-options'
            }).insertAfter($styledSelect);
            for (let i = 0; i < numberOfOptions; i++) {
                $('<li />', {
                    text: $this.children('option').eq(i).text(),
                    rel: $this.children('option').eq(i).val()
                }).appendTo($list);
            }
            let $listItems = $list.children('li');
            $styledSelect.click(function(e) {
                e.stopPropagation();
                $('div.select-styled.active').not(this).each(function(){
                    $(this).removeClass('active').next('ul.select-options').hide();
                });
                $(this).toggleClass('active').next('ul.select-options').toggle();
            });
            $listItems.click(function(e) {
                e.stopPropagation();
                $styledSelect.text($(this).text()).removeClass('active');
                $this.val($(this).attr('rel'));
                $list.hide();
                $listItems.removeClass('recent_select');
                $(this).addClass('recent_select');
                //console.log($this.val());
            });
            $(document).click(function() {
                $styledSelect.removeClass('active');
                $list.hide();
            });
        }
    });
    // function PrintDiv()
    // {
    //    let $clone = $("#report_wrapper").clone();
    //    $clone.find('.text-center').css('text-align','center');
    //    $clone.find('td').css('border','0.25px solid black');
    //    $clone.find('td').css('padding','3px');
    //    $clone.find('.right_scroll').css('width','100%');
    //    $clone.find('.cc_report_table').css('width','100%');
    //    $clone.find('h4.text-center').css('margin','5px');
    //    $clone.find('h5.text-center').css('margin','5px');
    //    $clone.find('.cc_report_table').css('margin-bottom','5px');
    //    $clone.find('.cc_report_table').css('border-collapse','collapse');
    //    $clone.find('.result_row').css('font-weight','bold');
    //    let contents = $($clone).html();
    //     var frame1 = document.createElement('iframe');
    //     frame1.name = "frame1";
    //     frame1.style.position = "absolute";
    //     frame1.style.top = "-1000000px";
    //     document.body.appendChild(frame1);
    //     var frameDoc = frame1.contentWindow ? frame1.contentWindow : frame1.contentDocument.document ? frame1.contentDocument.document : frame1.contentDocument;
    //     frameDoc.document.open();
    //     frameDoc.document.write('<html><head><title>DIV Contents</title>');
    //     frameDoc.document.write('</head><body>');
    //     frameDoc.document.write(contents);
    //     frameDoc.document.write('</body></html>');
    //     frameDoc.document.close();
    //     setTimeout(function () {
    //         window.frames["frame1"].focus();
    //         window.frames["frame1"].print();
    //         document.body.removeChild(frame1);
    //     }, 100);
    //     return false;
    // }
    // function printData()
    // {
    //    var divToPrint=document.getElementById("report_wrapper");
    //    newWin= window.open("");
    //    let $clone = $("#report_wrapper").clone();
    //    $clone.find('.text-center').css('text-align','center');
    //    $clone.find('td').css('border','0.25px solid black');
    //    $clone.find('td').css('padding','3px');
    //    $clone.find('.right_scroll').css('width','100%');
    //    $clone.find('.cc_report_table').css('width','100%');
    //    $clone.find('h4.text-center').css('margin','5px');
    //    $clone.find('h5.text-center').css('margin','5px');
    //    $clone.find('.cc_report_table').css('margin-bottom','5px');
    //    $clone.find('.cc_report_table').css('border-collapse','collapse');
    //    $clone.find('.result_row').css('font-weight','bold');
    //    // $clone.find('.result_row').css('font-size','14px');
    //    // $clone.find('.cc_report_table').css('table-layout','fixed');
    //    // document.write($clone.html());
    //     newWin.document.write($($clone).html());
    //     newWin.print();
    //     newWin.close();
    // }
    // $(".print_this").click(function(){
    //     printData();
    //     //PrintDiv();
    // });
    let report_heading = "Invoice Report";
    let application_base_url = 'https://beta.aipsoft.com/';
    let no_of_decimal_places = 2;
    // console.log(application_base_url);
    let date_format = 'dd-mm-yyyy';
    let time_zone   = 'asia/dubai';
     $.fn.openPopup = function( settings ) {
        var elem = $(this);
        // Establish our default settings
        var settings = $.extend({
          anim: 'fade'
        }, settings);
        elem.show();
        elem.find('.popup-content').addClass(settings.anim+'In');
        }
              
        $.fn.closePopup = function( settings ) {
            var elem = $(this);
            // Establish our default settings
            var settings = $.extend({
          anim: 'fade'
          }, settings);
          elem.find('.popup-content').removeClass(settings.anim+'In').addClass(settings.anim+'Out');
          setTimeout(function(){
            elem.hide();
            elem.find('.popup-content').removeClass(settings.anim+'Out')
          }, 500);
    }
    let getTwentyFourHourTime = function getTwentyFourHourTime(amPmString) { 
        var d = new Date("1/1/2017 " + amPmString); 
        return d.getHours() + ':' + d.getMinutes(); 
    }
    // let working_time_start    = "6:32 PM";
    // let working_time_end      = "6:00 AM";
    let working_time = '12:00 AM-11:59 PM';

    //console.log(working_time);
    //return false;

    let working_time_start    = ""; //"10:30 AM";
    let working_time_end      = ""; //"11:00 PM";
    if(working_time != "")
    {
        working_time_arr = working_time.split("-"); 
        working_time_start = working_time_arr[0];
        working_time_end   = working_time_arr[1];
    }
    console.log(working_time_start);
    console.log(working_time_end);
    if(working_time_start !="" && working_time_end !="")
    {
        let working_time_start_tf = getTwentyFourHourTime(working_time_start);
        let working_time_end_tf   = getTwentyFourHourTime(working_time_end);
        console.log({working_time_start_tf});
        console.log({working_time_end});
        var working_time_start_tf_sp = working_time_start_tf.split(":");
        var working_time_end_tf_sp   = working_time_end_tf.split(":");
        // console.log(working_time_start_tf_sp);
        let multiple_day = 0;
        let timeStart = new Date("01/01/2007 " + working_time_start);
        let timeEnd = new Date("01/01/2007 " + working_time_end);
        let diff = (timeEnd - timeStart) / 60000; //dividing by seconds and milliseconds
        let minutes = diff % 60;
        let hours = (diff - minutes) / 60;
        console.log({diff});
        console.log({hours});
        console.log({minutes});
        if(hours < 0 || minutes < 0)multiple_day = 1;
        console.log({multiple_day});
        // return false;
        if(multiple_day == 1)
        {
            let current_time_hour   = moment.tz(moment(), time_zone).format('HH');
            let current_time_minute = moment.tz(moment(), time_zone).format('mm');
            let sub_day = 0;
            current_time_hour   = Number(current_time_hour);
            current_time_minute = Number(current_time_minute);
            if(current_time_hour < working_time_end_tf_sp[0])//not reached the closing time
            {
                sub_day = 1;
                start = moment().subtract(sub_day,'days');
            }
            var predefined_date_selection = {
               'Today': [moment(start).set({"hour": working_time_start_tf_sp[0], "minute": working_time_start_tf_sp[1]}),moment(start).add(1, 'days').set({"hour": working_time_end_tf_sp[0], "minute": working_time_end_tf_sp[1]})],

               'Yesterday': [moment().subtract(1+sub_day, 'days').set({"hour": working_time_start_tf_sp[0], "minute": working_time_start_tf_sp[1]}), moment(start).set({"hour": working_time_end_tf_sp[0], "minute": working_time_end_tf_sp[1]})],

               'Last 7 Days': [moment().subtract(6+sub_day, 'days').set({"hour": working_time_start_tf_sp[0], "minute": working_time_start_tf_sp[1]}), moment(start).add(1, 'days').set({"hour": working_time_end_tf_sp[0], "minute": working_time_end_tf_sp[1]})],

               'Last 30 Days': [moment().subtract(29+sub_day, 'days').set({"hour": working_time_start_tf_sp[0], "minute": working_time_start_tf_sp[1]}), moment(start).add(1, 'days').set({"hour": working_time_end_tf_sp[0], "minute": working_time_end_tf_sp[1]})],

               'This Month': [moment().startOf('month').set({"hour": working_time_start_tf_sp[0], "minute": working_time_start_tf_sp[1]}), moment(start).endOf('month').add(1, 'days').set({"hour": working_time_end_tf_sp[0], "minute": working_time_end_tf_sp[1]})],

               'Last Month': [moment().subtract(1, 'month').startOf('month').set({"hour": working_time_start_tf_sp[0], "minute": working_time_start_tf_sp[1]}), moment(start).subtract(1, 'month').endOf('month').add(1, 'days').set({"hour": working_time_end_tf_sp[0], "minute": working_time_end_tf_sp[1]})],
               'Last Year': [moment().subtract(1, 'year').startOf('year').set({"hour": working_time_start_tf_sp[0], "minute": working_time_start_tf_sp[1]}), moment().subtract(1, 'year').endOf('year').set({"hour": working_time_end_tf_sp[0], "minute": working_time_end_tf_sp[1]})],
               'All': [moment().subtract(250, 'year').set({"hour": working_time_start_tf_sp[0], "minute": working_time_start_tf_sp[1]}), moment().endOf('year').set({"hour": working_time_end_tf_sp[0], "minute": working_time_end_tf_sp[1]})],
               'Financial Year': [moment().startOf('year').set({"hour": working_time_start_tf_sp[0], "minute": working_time_start_tf_sp[1]}), moment(start).endOf('year').add(1, 'days').set({"hour": working_time_end_tf_sp[0], "minute": working_time_end_tf_sp[1]})]
            }
        }
        else
        {
            var predefined_date_selection = {
               'Today': [moment(start).set({"hour": working_time_start_tf_sp[0], "minute": working_time_start_tf_sp[1]}),moment(start).set({"hour": working_time_end_tf_sp[0], "minute": working_time_end_tf_sp[1]})],

               'Yesterday': [moment().subtract(1, 'days').set({"hour": working_time_start_tf_sp[0], "minute": working_time_start_tf_sp[1]}), moment().subtract(1, 'days').set({"hour": working_time_end_tf_sp[0], "minute": working_time_end_tf_sp[1]})],

               'Last 7 Days': [moment().subtract(6, 'days').set({"hour": working_time_start_tf_sp[0], "minute": working_time_start_tf_sp[1]}), moment().set({"hour": working_time_end_tf_sp[0], "minute": working_time_end_tf_sp[1]})],

               'Last 30 Days': [moment().subtract(29, 'days').set({"hour": working_time_start_tf_sp[0], "minute": working_time_start_tf_sp[1]}), moment().set({"hour": working_time_end_tf_sp[0], "minute": working_time_end_tf_sp[1]})],

               'This Month': [moment().startOf('month').set({"hour": working_time_start_tf_sp[0], "minute": working_time_start_tf_sp[1]}), moment().endOf('month').set({"hour": working_time_end_tf_sp[0], "minute": working_time_end_tf_sp[1]})],

               'Last Month': [moment().subtract(1, 'month').startOf('month').set({"hour": working_time_start_tf_sp[0], "minute": working_time_start_tf_sp[1]}), moment().subtract(1, 'month').endOf('month').set({"hour": working_time_end_tf_sp[0], "minute": working_time_end_tf_sp[1]})],
               'Last Year': [moment().subtract(1, 'year').startOf('year').set({"hour": working_time_start_tf_sp[0], "minute": working_time_start_tf_sp[1]}), moment().subtract(1, 'year').endOf('year').set({"hour": working_time_end_tf_sp[0], "minute": working_time_end_tf_sp[1]})],
               'All': [moment().subtract(250, 'year').set({"hour": working_time_start_tf_sp[0], "minute": working_time_start_tf_sp[1]}), moment().endOf('year').set({"hour": working_time_end_tf_sp[0], "minute": working_time_end_tf_sp[1]})],
                'Financial Year': [moment().startOf('year').set({"hour": working_time_start_tf_sp[0], "minute": working_time_start_tf_sp[1]}), moment().endOf('year').set({"hour": working_time_end_tf_sp[0], "minute": working_time_end_tf_sp[1]})]
            }
        }
        
    }
    else
    {
        var predefined_date_selection = {
           'Today': [moment(start).startOf('day'),moment(start).endOf('day')],
           'Yesterday': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
           'Last 7 Days': [moment().subtract(6, 'days').startOf('day'), moment().endOf('day')],
           'Last 30 Days': [moment().subtract(29, 'days').startOf('day'), moment().endOf('day')],
           'This Month': [moment().startOf('month'), moment().endOf('month')],
           'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
           'Financial Year': [moment().startOf('year'), moment().endOf('year')]
        }
    }
    moment.tz.setDefault(time_zone);
    var start = moment();//.subtract(29, 'days');
    date_format = date_format.toUpperCase();
    console.log(date_format);
    console.log(time_zone);
    var end = moment();
    function cb1(start, end,manual) {
        let single_date_temp = $('#reportrange3').parent('.each_filter_settings').data('single_date');
        if(single_date_temp == 1)
            $('#reportrange3 span').html(end.format(date_format));
        else
            $('#reportrange3 span').html(start.format(date_format+" "+"hh:mm A") + ' to ' + end.format(date_format+" "+"hh:mm A"));
        // if(manual != undefined)
        // {
        //     handleSettingData(0,0);
        // }
    }
    function cb2(start, end,manual) {
        $('#reportrange3 span').html(end.format(date_format));
        // if(manual != undefined)
        // {
        //     handleSettingData(0,0);
        // }
    }
    // moment(each_order['billing_date'],"YYYY/MM/DD").format("DD-MM-YYYY")
    
    let single_date = $('#reportrange3').parent('.each_filter_settings').data('single_date');
    console.log("single_date - "+single_date);
    if(single_date == 1)
    {

        $('#reportrange3').daterangepicker({
            linkedCalendars: false,
            showDropdowns : true,
            timePicker: false,
            startDate: start,
            endDate: end,
            singleDatePicker:true,
            locale: {
                format: date_format+'hh:mm A'
            },
            // moment(date).tz('Europe/Berlin').format(format)
            // ranges: predefined_date_selection
        }, cb1);
    }
    else
    {
        $('#reportrange3').daterangepicker({
            linkedCalendars: false,
            showDropdowns : true,
            timePicker: true,
            startDate: start,
            endDate: end,
            locale: {
                format: date_format+'hh:mm A'
            },
            // moment(date).tz('Europe/Berlin').format(format)
            ranges: predefined_date_selection
        }, cb1);    
    }
    

    function cb(start, end,manual) {
        // $('#reportrange2 span').html(start.format(date_format+" "+"hh:mm A") + ' to ' + end.format(date_format+" "+"hh:mm A"));
        // if(manual != undefined)
        // {
        //     handleSettingData(0,0);
        // }
    }
    // moment(each_order['billing_date'],"YYYY/MM/DD").format("DD-MM-YYYY")
    // $('#reportrange2').daterangepicker({
    //     linkedCalendars: false,
    //     showDropdowns : true,
    //     timePicker: true,
    //     startDate: start,
    //     endDate: end,
    //     locale: {
    //         format: date_format+'hh:mm A'
    //     },
    //     // moment(date).tz('Europe/Berlin').format(format)
    //     ranges: predefined_date_selection
    // }, cb);
    // cb(moment(start).startOf('day'),end.endOf('day'));
    // selected_range_arr = (predefined_date_selection['Today']);
    // cb(selected_range_arr[0],selected_range_arr[1]);
    // cb1(selected_range_arr[0],selected_range_arr[1]);
    // $(".daterangepicker").find("li").eq(0).trigger('click');
    // $(this).trigger('click');
    let dynamic_report_column = function(data)
    {
        var summable_column = data[1];
        data = data[0];
        console.log("===========summable_column================");
        console.log(summable_column);
        // return false;
        $("#main").addClass('skeleton');
        let report_name      = 'unpaid_sales_invoices';
        save                 = $("body").data('save');
        from_settings        = $("body").data('from_settings');
        disable_serverside   = $("body").data('disable_serverside');
        let filter_setings_data  = [];
        let pred_date = "";
        let exclude_in_sum = '';
        let exclude_filter = '';
        let substitute_value_with = '';
        let substitute_from_date_with = '';
        let skip_this = '';
        let single_date_from_date = '';
        //console.log($(".each_filter_settings"));
        //exit(0);
        $(".each_filter_settings").each(function(){
            switch($(this).data('type'))
            {
                case 'date':
                    let date_only   = $(this).data('date_only');
                    let single_date = $(this).data('single_date'); 
                    substitute_value_with    = $(this).data('substitute_value_with'); 
                    substitute_from_date_with = $(this).data('substitute_from_date_with'); 
                    skip_this                 = $(this).data('skip_this');   
                    single_date_from_date     = $(this).data('single_date_from_date');   
                    let date = "";
                    if(from_settings == 1)
                        date = $('#reportrange3 span').text();
                    // else if(from_settings == 0)
                    //    date  = $('#reportrange2 span').text();
                    else
                       date  = $(".range_span").text();
                   // console.log(date);
                   // exit(0);
                    let date_split = date.split(" to ");
                    let from_date = "";
                    let from_time = "";
                    let to_date   = "";
                    let to_time   = "";
                    if(date_split.length == 2)
                    {
                        from_date = date_split[0].substring(0,date_split[0].indexOf(" "));
                        from_time = date_split[0].substring(date_split[0].indexOf(" "));
                        to_date   = date_split[1].substring(0,date_split[0].indexOf(" "));
                        to_time   = date_split[1].substring(date_split[0].indexOf(" "));
                        from_date = from_date.trim();
                        from_time = from_time.trim();
                        to_date   = to_date.trim();
                        to_time   = to_time.trim();
                    }
                        // console.log(date_only);
                    if(date_only == 1)
                    {
                        to_time  = ""; 
                        from_time = "";
                        // console.log('I am insede');
                    }
                    if(single_date == 1)
                    {
                        from_date  = to_date= $('#reportrange3 span').text();
                        if(report_name == 'stock_report_as_on_new' && single_date_from_date == 1){
                           from_date = '01-01-2000'; 
                           to_date= $('#reportrange3 span').text();
                        }           
                    }

                    // else
                    //     console.log('I am outsede');
                    let index_found = date_format.indexOf('-');
                    if(index_found == -1)
                    {
                        index_found = date_format.indexOf('/');
                    }
                        // console.log(from_date);

                    let date_divider = date_format.substring(index_found, index_found+1);
                    let from_date_temp = from_date.split(date_divider);
                    let to_date_temp   = to_date.split(date_divider);
                    // console.log(date_divider);
                    // console.log(to_date_temp);
                    // exit(0);
                    to_date   = to_date_temp[2]+"-"+to_date_temp[1]+"-"+to_date_temp[0];
                    from_date = from_date_temp[2]+"-"+from_date_temp[1]+"-"+from_date_temp[0];
                    pred_date  = ($('#reportrange3').data('daterangepicker').chosenLabel);
                    console.log(pred_date);
                    filter_setings_data.push({'selected_value':pred_date,'filter_type':'date','from_date':from_date,'from_time':from_time,'to_date':to_date,'to_time':to_time,'connected_to':$(this).data('connected_to'), 'exclude_filter':$(this).data('exclude_filter'),'substitute_value_with':substitute_value_with,'substitute_from_date_with':substitute_from_date_with,'skip_this':skip_this});
                    console.log(filter_setings_data);
                   // exit(0);
                break;
                case 'select':
                    substitute_value_with = $(this).data('substitute_value_with'); 
                    exclude_in_sum = $(this).data('exclude_in_sum');
                    // console.log($(this).find(".filter_item"));
                    filter_setings_data.push({'filter_type':'select','selected_value' : $(this).find(".filter_item").val(),'connected_to' : $(this).data('connected_to'),'data_type':$(this).data('data_type'),'exclude_in_sum':exclude_in_sum, 'exclude_filter':$(this).data('exclude_filter'),'substitute_value_with':substitute_value_with});
                break;
                case 'multi_select':
                    substitute_value_with = $(this).data('substitute_value_with'); 
                    exclude_in_sum = $(this).data('exclude_in_sum');
                    var selected=[];
                     $('.multi_filter_item :selected').each(function(){
                         selected[$(this).val()]=$(this).text();
                        });
                    console.log(selected);
                       
                    console.log($(this).find(".multi_filter_item"));
                    console.log($(this).find(".multi_filter_item").val())
                    filter_setings_data.push({'filter_type':'multi_select','selected_value' : $(this).find(".multi_filter_item").val(),'connected_to' : $(this).data('connected_to'),'data_type':$(this).data('data_type'),'condition_type':$(this).data('condition_type'),'exclude_in_sum':exclude_in_sum, 'exclude_filter':$(this).data('exclude_filter'),'substitute_value_with':substitute_value_with});
                break;
                case 'textbox':
                    substitute_value_with = $(this).data('substitute_value_with'); 
                    let partial          = $(this).data('partial');
                    exclude_in_sum       = $(this).data('exclude_in_sum');
                    let identifier_value = $(this).data('identifier_value');
                    let condition        = $(this).data('condition'); 
                    filter_setings_data.push({'filter_type':'textbox','selected_text' : $.trim($(this).find(".filter_item").val()),'selected_value' : $(this).find(".filter_item").val()!= "" ? $(this).find(".filter_item").data('selected_value') : "",'connected_to' : $(this).data('connected_to'),'data_type':$(this).data('data_type'),'partial':partial,'identifier_value':identifier_value,'exclude_in_sum':exclude_in_sum,'condition':condition, 'exclude_filter':$(this).data('exclude_filter'),'substitute_value_with':substitute_value_with}); 
                break;
                case 'branch':
                    substitute_value_with = $(this).data('substitute_value_with'); 
                    filter_setings_data.push({'filter_type':'branch','selected_value' : $(".branch_id").val(),'connected_to':$(this).data('connected_to'),'substitute_value_with':substitute_value_with});
                break;
                case 'checkbox':
                    let checked = $(this).find(".filter_item").is(":checked") ? "1" : "0";
                    filter_setings_data.push({'filter_type':'checkbox','selected_value' : checked,'connected_to':$(this).data('connected_to'),'condition':$(this).find(".filter_item").data('condition')});
                break;
            }
        });
        console.log(filter_setings_data);
        // return false;
        display_details = [];
        $(".display_details").each(function(){
            // console.log($(this).data('identi'));
            if($(this).is(":checked"))
            {
                display_details.push($(this).data('identi'));
            }
        });
        let paper_size       = $(".paper_size:checked").data('size');
        let page_orientation = $(".page_orientation:checked").data('orientation');
        let font             = $(".selection_icon_span").text();
        let font_size        = $(".font_size_span").text();
        let margins          = [$(".top_margin").val(),$(".right_margin").val(),$('.bottom_margin').val(),$(".left_margin").val()];
        let tbl_border_wdth  = $(".border_width_span").text();
        let tbl_padding      = $(".tbl_padding_span").text();
        print_preferences['display_details']  = display_details;
        print_preferences['page_orientation'] = page_orientation;
        print_preferences['paper_size']       = paper_size;
        print_preferences['font']             = font;
        print_preferences['font_size']        = font_size;
        print_preferences['margins']          = margins;      
        print_preferences['tbl_border_wdth']  = tbl_border_wdth;
        print_preferences['tbl_padding']      = tbl_padding;

       console.log(print_preferences);
       //return false;
        // let product_name = $(".search_product").val();
        $(".product_info").remove();
        $(".report_wrapper").before('<div class="product_info"><h4>Report of <span class="dynamic_report_name"></span> <span class="range_span"></span></h4></div>');
        
        let server_side_handle = true;
        if(disable_serverside == 1)server_side_handle = false;
        console.log(server_side_handle);
        $('.dynamic_report_table_tfoot').empty();
        $('.dynamic_report_table_thead').empty();
        $('.dynamic_report_table_tbody').empty();
        let split_data = "";
        let removed_column_list  = [];
        let removed_column_index = [];
        let col_width_list = [];
        let col_width_list1 = [];
        let col_width_name_list = [];
        let col_width = "";
        let avaliable_column_name = "";
        let perc_avail = "";
        column_for_sort = [];
        $(".selected_columns_wrapper .sub_item p").each(function(){
            col_width = $(this).next('.table_col_width').val();
            avaliable_column_name = $(this).text();
            avaliable_column_name = $.trim(avaliable_column_name);
            perc_avail = col_width.substring(col_width.length-1);
            if(perc_avail != "%")
            {
                col_width = col_width + "%";
            } 
            col_width_list1.push(col_width);
            col_width_name_list.push(avaliable_column_name);  
            col_width_list[avaliable_column_name] = col_width;//With Space will not be handled in the PHP
            column_for_sort.push($(this).data('column_identifier'));
        });
        // console.log(col_width_list1);
        // console.log(col_width_name_list);
        // return false;
        $(".removed_columns_wrapper .sub_item p").each(function(){
            removed_column_name = $(this).text();
            removed_column_name = $.trim(removed_column_name);
            removed_column_list.push(removed_column_name);
            removed_column_index.push($(this).data('column_order'));
        });
        // console.log(removed_column_list);
     //    console.log(removed_column_index);
        //return false;
        let thead = "<tr><th width='2%;'>SI.No</th>";
        let tfoot = "<tr><th class='sum_col_ft'></th>";
        let column_counter = 1;
        // console.log(data);
        // console.log(col_width_list);
        // console.log(data);
        // return false;
        // return false;
        grouping_column_index = "";
        console.log(data);
        console.log("data goes here");
        if($(".grouping_select").length > 0)
        {
            let dum_data = '';
            let grouping_select = $(".grouping_select").val();
            console.log(grouping_select);
            $(".sub_item").removeClass('group_avail');
            $(".sub_item").each(function(){
                dum_data = $.trim($(this).find('p').text());
                if(dum_data == grouping_select)
                {
                     console.log(dum_data + '::' + grouping_select);
                    $(this).addClass('group_avail');
                }   
            });
            //return false;
        }
        $.each(data,function(index,each_data){
            split_data = each_data.split(".");
            // console.log(split_data);
            if(split_data.length > 1)
            {
                index = Number(index) + 1;
                if($.inArray(index, removed_column_index) == -1)
                {
                    avaliable_column_name = $(".sub_item.group_avail p").text();
                    group_avail_column_name = $.trim(avaliable_column_name);
                    // console.log("group_avail_column_name -"+group_avail_column_name);
                    if(group_avail_column_name != "" && group_avail_column_name != undefined && group_avail_column_name != null)
                    {
                        if(split_data[1] == group_avail_column_name)grouping_column_index = column_counter;
                    }
                    ++column_counter;
                    // if($.inArray(split_data[1], removed_column_list) == -1)
                    thead += "<th>"+split_data[1]+"</th>";
                    tfoot += "<th style='font-weight:bold;' class='sum_col_ft'></th>";    
                }
                
            }   
            else
            {
                index = Number(index) + 1;
                 // console.log(col_width_list[split_data[0]]);
                if($.inArray(index, removed_column_index) == -1)
                {
                    avaliable_column_name = $(".sub_item.group_avail p").text();
                    group_avail_column_name = $.trim(avaliable_column_name);
                    // console.log("group_avail_column_name -"+group_avail_column_name);
                    if(group_avail_column_name != "" && group_avail_column_name != undefined && group_avail_column_name != null)
                    {
                        if(split_data[0] == group_avail_column_name)grouping_column_index = column_counter;
                    }
                    ++column_counter;
                    thead += "<th width='"+col_width_list[split_data[0]]+"'>"+split_data[0]+"</th>";
                    tfoot += "<th style='font-weight:bold;' class='sum_col_ft'></th>";
                }   
                // else
                // {
                //     console.log(split_data[0]);
                // }
                // if($.inArray(split_data[0], removed_column_list) == -1)
                  
            }
        });
        tfoot += "</tr>";
        thead += "</tr>";
        // console.log(thead);
        //return false;
        $('.dynamic_report_table_thead').append(thead);
        if(summable_column != "")
        {
            $('.dynamic_report_table_tfoot').append(tfoot);
            // if (end == data.length)
            // {
               
            // }
            
        }   
        // console.log(from_date);
        // console.log(to_date);
        // return false;
        console.log(filter_setings_data);
        console.log("grouping_column_index");
        let grouping_column_index_arr = [];
        if(grouping_column_index != "")
        {
            grouping_column_index_arr = [
               { "visible": false, "targets": grouping_column_index }
            ];
        }
        $("body").data('grouping_column_index',grouping_column_index);
        var find_table = $('.dynamic_report_table').DataTable({
            "columnDefs": grouping_column_index_arr,
            // "columnDefs": [
            //   { "visible": false, "targets": grouping_column_index }
            // ],
            "footerCallback": function ( row, data, start, end, display ) {
                // console.log(summable_column);
                var api = this.api(), data;
     
                // converting to interger to find total
                var intVal = function ( i ) {
                    return typeof i === 'string' ?
                        i.replace(/[\$,]/g, '')*1 :
                        typeof i === 'number' ?
                            i : 0;
                };

                 // computing column Total of the complete result 
                let column_count = (tfoot.match(/<th>/g) || []).length;
                let i = 0;
                if(summable_column != "")
                {
                    //let last_pagination = $("li.paginate_button.active a"
                    // let per_page      = $("#DataTables_Table_0_length select").val();
                    // let current_page = end / per_page;
                    // console.log("per_page - " + per_page);
                    // console.log("current_page - " + current_page);
                    setTimeout(function(){
                        let current_pagination  = $("li.paginate_button.active a").text();
                        let last_pagination     = $("li.paginate_button").eq($("li.paginate_button").length -3).find('a').text();
                        if(last_pagination == current_pagination)
                        {
                            $(".dynamic_report_table_tfoot").removeClass('invisibl');
                        }
                        else
                        {
                           $(".dynamic_report_table_tfoot").addClass('invisibl');   
                        }
                        console.log("last_pagination -" + last_pagination);
                        console.log("current pagi -" + $("li.paginate_button.active a").text());
                    },1);    
                    // setTimeout(function(){
                    //     // let paginations   = $("li.paginate_button").length -2;        //75 - 50 = 25
                    //     // let per_page      = $("#DataTables_Table_0_length select").val(); //2
                    //     $(".paginate_button.active").index()
                    //     console.log(" paginations -"+paginations);
                    //     console.log(" per_page -"+per_page);
                    // },500)
                    
                    // console.log(start+" - "+end);
                   // $( api.column( 0 ).footer() ).html('<span class="summable_column_span"></span>');    
                }
                
                // for(i = 5; i < column_count ; i++)
                // {
                //     var monTotal = api
                //     .column(i)
                //     .data()
                //     .reduce( function (a, b) {
                //         return intVal(a) + intVal(b);
                //     }, 0 );
                // // Update footer by showing the total with the reference of the column index 
                //  $( api.column(i).footer() ).html(monTotal);    
                // }
                 
            },
            "pagingType": "full_numbers",
            language: {
                paginate: {
                  first:      '<i class="fas fa-angle-double-left"></i>',
                  last:       '<i class="fas fa-angle-double-right"></i>',  
                  next:       '<i class="fas fa-angle-right"></i>',
                  previous:   '<i class="fas fa-angle-left"></i>'  
                }
            },
            fixedHeader: {
                header: false,
                footer: false,
            },
            dom: 'lBfrtip',
            buttons: [
                {
                    extend: 'print',
                    text: 'Print',
                    footer: true,
                    autoPrint: true,
                    exportOptions: {
                        format: {
                            header: function ( data, column, row )
                            {
                                let indx = data.indexOf("<");
                                if(indx > 0)
                                {
                                    return data.substring(0,indx);  
                                    
                                }
                                else
                                    return data;
                            },
                        }
                    },
                    customize: function (win) {
                        // report_heading = $(".product_info").find('h4').html();
                        // let closing_stock = $(".closing_stock_h4").text();
                        // $(win.document.body).find('h1').css('display','none');
                        // $(win.document.body).prepend('<h4></h4>');
                        // $(win.document.body).find('h4').css('text-align','center');
                        // $(win.document.body).find('h4').html(report_heading);
                        // $(win.document.body).find('h4').find('span').css('display','block');
                        // $(win.document.body).find('table').after('<h5>'+closing_stock+'</h5>');
                        // $(win.document.body).find('h5').css('text-align','right');
                        // $(win.document.body).find('h5').css('margin-right','100px');
                        // $(win.document.body).find('.report_table').append('<tr><td colspan="3">What man</td><td colspan="1">what is this</td></tr>');
                    }
                },
                {
                    autoPrint: true,
                    extend: 'print',
                    text: 'Print current page',
                    footer: true,
                    exportOptions: {
                        modifier: {
                            page: 'current'
                        },
                        // stripHtml: false,
                        format: {
                            header: function ( data, column, row )
                            {
                                console.log(column);
                                let indx = data.indexOf("<");
                                if(indx > 0)
                                {
                                    return data.substring(0,indx);  
                                    
                                }
                                else
                                    return data;
                            }
                        }
                    },
                    customize: function (win) {
                        report_heading = $(".product_info").find('h4').html();
                        let closing_stock = $(".closing_stock_h4").text();
                        $(win.document.body).find('h1').css('display','none');
                        $(win.document.body).prepend('<h4></h4>');
                        $(win.document.body).find('h4').css('text-align','center');
                        $(win.document.body).find('h4').html(report_heading);
                        $(win.document.body).find('h4').find('span').css('display','block');
                        $(win.document.body).find('table').after('<h5>'+closing_stock+'</h5>');
                        $(win.document.body).find('h5').css('text-align','right');
                        $(win.document.body).find('h5').css('margin-right','right');
                        $(win.document.body).find('h5').css('margin-right','100px');
                    }
                },
                {
                    extend: 'excel',
                    text: 'All pages',
                },
                {
                    extend: 'excel',
                    text: 'Save current page',
                    exportOptions: {
                        modifier: {
                            page: 'current'
                        }
                    }
                },
                
            ],
            initComplete: function () {
                console.log(this);
                // $(".filter_select").remove();
                //CalculateTableSummary(this);
            },
            // order: [[0, 'DESC']],
            //lengthMenu: [10, 50, 100,500, "All"],
            // columnDefs: [{
            //     targets: [0,2,3,4,6],
            //     orderable: false,
            //     searchable: false,
            // }],
            processing: true,
            serverSide: server_side_handle,
            "autoWidth": false,
            ajax: ({
                method   : 'POST',
                url      : base_url+'reports/generate_report',
                data     : {'report_type': 'dynamic_report','report_name':report_name,'save':save,'predefined_date':pred_date,'removed_column_list':removed_column_list,'removed_column_index':removed_column_index,'filter_setings_data':filter_setings_data,'col_width_list1':col_width_list1,'col_width_name_list':col_width_name_list,'print_preferences':print_preferences,'indirect_open':indirect_open,'column_for_sort':column_for_sort},
                beforeSend: function (request) {
                    // console.log("before send");
                    // console.log(request);
                    // return false;
                },
                complete: function (request) {
                    console.log(request);
                    report_actual_name   = request['responseJSON']['report_actual_name'];
                    report_columns       = request['responseJSON']['report_columns'];
                    var summable_column_data = request['responseJSON']['summable_column'];
                    sort_column_return   = request['responseJSON']['sort_column_return'];
                    $("body").data('sort_column_return',sort_column_return);
                    row_link_arr  = request['responseJSON']['row_link_arr'];
                    row_color_arr = request['responseJSON']['row_color_arr'];
                    
                    // console.log(summable_column_data);
                    // console.log('Basheer');
                    let summable_text = "";
                    // console.log($(".dynamic_report_table_thead tr th"));
                    let column_name = "";
                    // console.log(end);
                    if($(".sum_col_ft").length > 0)
                    {
                        $(".dynamic_report_table_thead tr th").each(function(index){
                            
                            column_name = $(this).text().trim();
                            // console.log(column_name.length);
                            if(summable_column_data.hasOwnProperty(column_name))
                            {
                                console.log(column_name+' Is found in suimmable');
                                // summable_column_data[column_name] = Number(summable_column_data[column_name]).toFixed(2);
                                $(".sum_col_ft").eq(index).text(summable_column_data[column_name]);
                            }
                        });
                    }
                    var left_alignment_arr = [];
                    var right_alignment_arr = [];
                    var center_align_arr    = [];
                    $(".dynamic_report_table_thead tr th").each(function(index){
                        column_name = $(this).text();
                        // console.log(column_name);
                        // console.log(text_alignment);
                        let align_found = 0;
                        $.each(text_alignment, function(text_alignment_column, value ) {
                            // console.log(text_alignment_column + ": " + value );
                            column_name = $.trim(column_name);
                            text_alignment_column = $.trim(text_alignment_column);
                            if(text_alignment_column.toLowerCase() == column_name.toLowerCase())
                            {
                                if(value.toLowerCase() =='left')left_alignment_arr.push(index);
                                else if(value.toLowerCase() =='right')right_alignment_arr.push(index);
                                else if(value.toLowerCase() =='center')center_align_arr.push(index);
                                align_found = 1;
                            }
                            // else left_alignment_arr.push(index);
                        });
                        if(align_found == 0)
                        {
                            left_alignment_arr.push(index);
                        }
                    });
                    // console.log(right_alignment_arr);
                    // console.log(right_alignment_arr);
                    // return false;
                    // alignment_arr
                    $.each(center_align_arr, function(index, alignment_indx) {
                        $(".dynamic_report_table_tbody tr").each(function(){
                            // console.log($(this).find('td').eq(alignment_indx));
                            $(this).find('td').eq(alignment_indx).css('text-align','center');
                        });
                        
                    });
                    $.each(left_alignment_arr, function(index, alignment_indx) {
                        $(".dynamic_report_table_tbody tr").each(function(){
                            // console.log($(this).find('td').eq(alignment_indx));
                            $(this).find('td').eq(alignment_indx).css('text-align','left');
                        });
                        
                    });
                    $.each(right_alignment_arr, function(index, alignment_indx ) {
                        $(".dynamic_report_table_tbody tr").each(function(){
                            $(this).find('td').eq(alignment_indx).css('text-align','right');
                        });
                    });
                    // $(".dynamic_report_table tbody tr").each(function(){

                    // });
                    console.log(" ==================== row_color_arr ==========================");
                    console.log(row_color_arr)
                    if(row_color_arr.length > 0)
                    {
                        let r_indxx = 0;
                        $(".dynamic_report_table tbody tr").each(function(){
                            console.log(r_indxx)
                            $(this).css('background', row_color_arr[r_indxx]);
                            if(row_color_arr[r_indxx])
                                $(this).find('td').css('color', '#fff');
                            if(report_name == 'pending_jobs'){
                                $(this).find('td').css('font-weight', 'bold');
                                $(this).find('td').css('font-size', '15px');
                            }
                            r_indxx++;
                        });
                    }
                    if(row_link_arr.length > 0)
                    {
                        let indxx = 0;
                        $(".dynamic_report_table tbody tr").each(function(){
                            $(this).data('out_side_link',row_link_arr[indxx++]);
                            $(this).addClass('clickable_tr');
                            //console.log(row_link_arr[indxx])
                            // console.log($(this));
                        });
                    }
                    console.log('basheer');
                    console.log(row_link_arr);
                    // $.each(summable_column_data,function(column_name,each_summable_column_value){
                    //     // if(summable_text != "")summable_text += " | ";
                    //     // console.log(summable_column[column_name]);
                    //     // if(summable_column[column_name] == "aip_product_stock.stock")
                    //     //   each_summable_column_value = each_summable_column_value + " PCS";
                    //     // summable_text += column_name+" : "+each_summable_column_value;
                    // });
                    // if(summable_text != "")
                    //     $(".summable_column_span").text(summable_text);
                    $(".dynamic_report_name").text(report_actual_name);
                    // console.log($(".each_print_option.active").data('type'));
                    // if($(".each_print_option.active").data('type') == "all_pages")
                    // {
                    //     $(".each_print_option").removeClass('active');
                    //     $('.buttons-print').eq(0).trigger('click');
                    // }
                    if($(".each_excel_button.active").data('type') == "all_pages")
                    {
                        $(".each_excel_button").removeClass('active');
                        $('.buttons-html5').eq(0).trigger('click');
                    }
                    $(".spin_loader_rpt").addClass('invisibl');
                    $("#main").removeClass('skeleton');
                }
            }),
            drawCallback: function(){
                console.log("grouping_column_index-"+grouping_column_index);
                if(grouping_column_index != "")
                {
                    let api = this.api();
                    let rows = api.rows( {page:'current'} ).nodes();
                    let column_counts = $('.dynamic_report_table_thead').find('th').length;
                    let group_col_arr = api.column(grouping_column_index, {page:'current'} ).data().toArray();

                    let summableColumnIndexes = [];
                    if(summable_column != "" && typeof summable_column == "object")
                    {
                        let headings = $('.dynamic_report_table_thead th').map(function(){
                            return $.trim($(this).text()).toLowerCase();
                        }).get();

                        for(let columnName in summable_column)
                        {
                            if(!Object.prototype.hasOwnProperty.call(summable_column, columnName)) continue;
                            let indx = headings.indexOf($.trim(columnName).toLowerCase());
                            if(indx >= 0)summableColumnIndexes.push(indx);
                        }
                    }

                    let last = null;
                    let groupTotals = {};
                    let toNumber = function(txt){
                        if(txt == undefined || txt == null) return 0;
                        txt = String(txt).replace(/,/g,'').replace(/[^0-9.\-]/g,'');
                        let n = parseFloat(txt);
                        return isNaN(n) ? 0 : n;
                    };

                    for(let i = 0; i < group_col_arr.length; i++)
                    {
                        let group = group_col_arr[i];
                        let next_group = (i + 1 < group_col_arr.length) ? group_col_arr[i + 1] : null;

                        if(last !== group)
                        {
                            $(rows).eq(i).before('<tr class="group"><td colspan="'+column_counts+'">'+group+'</td></tr>');
                            groupTotals = {};
                            last = group;
                        }

                        for(let j = 0; j < summableColumnIndexes.length; j++)
                        {
                            let colIndex = summableColumnIndexes[j];
                            let cellText = $(rows).eq(i).find('td').eq(colIndex).text();
                            groupTotals[colIndex] = (groupTotals[colIndex] || 0) + toNumber(cellText);
                        }

                        if(summableColumnIndexes.length > 0 && (next_group === null || next_group !== group))
                        {
                            let cells = new Array(column_counts).fill('<td></td>');
                            for(let j = 0; j < summableColumnIndexes.length; j++)
                            {
                                let colIndex = summableColumnIndexes[j];
                                let val = groupTotals[colIndex] || 0;
                                cells[colIndex] = '<td style="text-align:right;">'+val.toFixed(no_of_decimal_places)+'</td>';
                            }
                            $(rows).eq(i).after('<tr class="group-subtotal">'+cells.join('')+'</tr>');
                        }
                    }

                }
                console.log(grouping_column_index);
                console.log('calling');

             //$('.report_table_arrow_btm').toggle(this.api().page.hasMore());
            }
        });
    }
    let retrieveReport = function(save,from_settings,disable_serverside){
        console.log("disable_serverside -");
        console.log(disable_serverside);
        let report_name = 'unpaid_sales_invoices';
        $("body").data('save',save);
        $("body").data('from_settings',from_settings);
        $("body").data('disable_serverside',disable_serverside);
        $.ajax({
            method   : 'POST',
            data     : {'report_name':report_name},
            url      : base_url+'reports/getTableColumns',
            dataType : "JSON",
            success  : dynamic_report_column
        });
    }   
    $("body").on('click','.retrive_btn',function(){
        if ( $.fn.dataTable.isDataTable('.dynamic_report_table')) 
        {
            $('.dynamic_report_table').DataTable().destroy();
        }
        retrieveReport(0,0,0);  
    });
    // $("body").on("click",'.each_excel_button',function(e){
    $(".each_excel_button").click(function(){    
        $(".each_excel_button").removeClass('active');
        $(this).addClass('active');
        let index = $(".each_excel_button").index($(this));
        console.log(index);
        if(index == 1)
        {
            if ( $.fn.dataTable.isDataTable('.dynamic_report_table')) 
            {
                $('.dynamic_report_table').DataTable().destroy();
            }
            retrieveReport(1,1,1);
        }
        else
        {
            $('.buttons-html5').eq(index).trigger('click'); 
        }
    });
    $(".each_print_option").click(function(){
        let index = $(".each_print_option").index($(this));
        if(index == 0 || index == 1)
        {
            $(".each_print_option").eq(0).addClass('selected');
            printFunction(index,0);
        }    
    });
    // $("body").on("click",'.each_print_option',function(e){
    //     let index = $(".each_print_option").index($(this));
    //     if(index == 0 || index == 1)
    //     {
    //         $(".each_print_option").eq(0).addClass('selected');
    //         printFunction(index,0);
    //     }    
    //     // $(".each_print_option").removeClass('active');
    //     // $(this).addClass('active');
    //     // let index = $(".each_print_option").index($(this));
    //     // //console.log(index);
    //     // if(index == 2)
    //     // {
    //     //     if ( $.fn.dataTable.isDataTable('.dynamic_report_table')) 
    //     //     {
    //     //         $('.dynamic_report_table').DataTable().destroy();
    //     //     }
    //     //     retrieveReport(1,1,1);
    //     // }
    //     // else if(index == 0)
    //     // {
    //     //     $('.buttons-print').eq(index).trigger('click'); 
    //     // }   
        
    //     // console.log(index);
    // });
    $("body").on("click",'.filter_select',function(e){
        console.log('clicked');
        // /e.stopImmediatePropagation();
        return false;
    });
    let handleSettingData = function(save,from_settings){
        console.log('in handle');
        if(!$(".search_product").hasClass('invalid'))
        {
            // $(".close-popup").trigger('click');
            if ( $.fn.dataTable.isDataTable('.dynamic_report_table')) 
            {
                $('.dynamic_report_table').DataTable().destroy();
            }
            retrieveReport(save,from_settings); 
        }   
    }
    $(".submit_save_report").click(function(){
        handleSettingData(1,1);
    });
    $(".submit_report").click(function(){
        $(".spin_loader_rpt").removeClass('invisibl');
        $(".property_close_popup").trigger('click');
        handleSettingData(1,1);
    });
    $(".move_to_removed_full").click(function(e,trigger){
         $(".selected_columns_list .sub_item").addClass('active');
         $(".move_to_removed").trigger('click');
    });
    $(".remove_from_removed_full").click(function(e,trigger){
         $(".removed_columns_list .sub_item:not(.invisibl)").addClass('active');
         $(".remove_from_removed").trigger('click');
    });
    $(".move_to_removed").click(function(e){
        $selected_columns     = $(".selected_columns_list .sub_item.active");
        // console.log($selected_columns);
        if($selected_columns.length>0)
        {
            let clone_element;
            $selected_columns.each(function(index,each_selected_column){
              clone_element = $(this).clone();
              $(this).remove();
              $(clone_element).removeClass('active');
              $(".removed_columns_wrapper").append(clone_element);
              
            }); 
        }
    });
    $(".remove_from_removed").click(function(e,trigger){
        $removed_columns     = $(".removed_columns_list .sub_item.active");
        // console.log($removed_columns);
        if($removed_columns.length>0)
        {
            let clone_element;
            $removed_columns.each(function(index,each_selected_column){
              clone_element = $(this).clone();
              $(this).remove();
              $(clone_element).removeClass('active');
              $(".selected_columns_wrapper").append(clone_element);
              
            }); 
        }
    });
    $("body").on("click",".sub_item",function(e){
        e.stopPropagation();
        $(this).toggleClass('active');
    });
    $("body").on("dblclick",".sub_item",function(e){
        e.stopPropagation();
        $(this).addClass('active');
        let add_remove = ($(this).parents('.selected_columns_list').length > 0 ) ? 1 : 0;
        if(add_remove == 1)
            $(".move_to_removed").trigger('click');
        else
            $(".remove_from_removed").trigger('click');
    });
    let filterLink = function(identifier,searching_value)
    {
        if(searching_value == "")
        {
            switch(identifier)
            {
                case 'rem':
                    $(".removed_columns_wrapper .sub_item").removeClass('invisibl');
                break;
                case 'sel':
                    $(".selected_columns_wrapper .sub_item").removeClass('invisibl');
                break;
            }   
        }
        else
        {
            let $sub_items = "";
            switch(identifier)
            {
                case 'rem':
                    $sub_items = $(".removed_columns_wrapper .sub_item");
                    $($sub_items).addClass('invisibl');
                    $($sub_items).each(function(index){
                        if($(this).text().toLowerCase().includes(searching_value))
                        {
                            $(this).removeClass('invisibl');
                        }
                    });
                break;
                case 'sel':
                    $sub_items = $(".selected_columns_wrapper .sub_item");
                    $($sub_items).addClass('invisibl');
                    $($sub_items).each(function(index){
                        if($(this).text().toLowerCase().includes(searching_value))
                        {
                            $(this).removeClass('invisibl');
                        }
                    });
                break;
            }
        }
    }
    $(".search_columns").keyup(function(e){
        e.preventDefault();
        let searching_value = $(this).val();
        if(e.which == 13  || e.keyCode==13)
        {
            if($(this).parents('.sel_wrap').length > 0)
            {
                filterLink('sel',searching_value.toLowerCase());
            }
            else
            {
                filterLink('rem',searching_value.toLowerCase());
            } 
        }
    });
    var default_display_columns = ["Branch","Invoice#","Order#","Ref#","Billing Date","Billing Time","Order Date","Order Time","Invoiced Staff","Ordered Staff","Salesman","Cust-Mobile","Customer Name","Order Type","Gross Amount","Discount","VAT","Round Off","Vatable Amount","Net Sale Amount","Paid Amount","Balance","Payment Info","Payment","Remark","Status"];
    var default_col_width       = {"Branch":"5%","Invoice#":"5%","Order#":"5%","Ref#":"5%","Billing Date":"5%","Billing Time":"5%","Order Date":"5%","Order Time":"5%","Invoiced Staff":"5%","Ordered Staff":"5%","Salesman":"5%","Cust-Mobile":"5%","Customer Name":"5%","Order Type":"5%","Gross Amount":"5%","Discount":"5%","VAT":"5%","Round Off":"5%","Vatable Amount":"5%","Net Sale Amount":"5%","Paid Amount":"5%","Balance":"5%","Payment Info":"5%","Payment":"5%","Remark":"5%","Status":"5%","Driver":"5%"};
    var to_be_hidden            = "SI Id,Ord Id";
    var text_alignment          = {"Gross Amount":"Right","Discount":"Right","VAT":"Right","Round Off":"Right","Vatable Amount":"Right","Net Sale Amount":"Right","Paid Amount":"Right","Balance":"Right"};
    var ua_data = {"col_width_name_list":["Branch","Invoice#","Order#","Ref#","Billing Date","Billing Time","Order Date","Order Time","Invoiced Staff","Ordered Staff","Salesman","Cust-Mobile","Customer Name","Order Type","Gross Amount","Discount","VAT","Round Off","Vatable Amount","Net Sale Amount","Paid Amount","Balance","Payment Info","Payment","Remark","Status","Driver"],"col_width_list1":["5%","5%","5%","5%","5%","5%","5%","5%","5%","5%","5%","5%","5%","5%","5%","5%","5%","5%","5%","5%","5%","5%","5%","5%","5%","5%","5%"],"removed_column_list":["SI Id","Ord Id"],"filter_setings_data":[{"filter_type":"date","selected_value":"Last Month","connected_to":"IF(SI.id IS NOT NULL,TIMESTAMP(SI.billing_date,SI.billing_time),TIMESTAMP(O.billing_date,O.billing_time))","selected_text":"","condition":""},{"filter_type":"branch","selected_value":"all_branches","connected_to":"IF(SI.id IS NOT NULL,SI.branch_id,O.branch_id)","selected_text":"","condition":""},{"filter_type":"multi_select","selected_value":"","connected_to":"IF(SI.id IS NOT NULL,SI.delivery_type_id,O.delivery_type_id)","selected_text":"","condition":""},{"filter_type":"multi_select","selected_value":"","connected_to":"PHIST.linked_account_id","selected_text":"","condition":""},{"filter_type":"select","selected_value":"","connected_to":"SI.driver_id","selected_text":"","condition":""}],"print_preferences":{"display_details":["org_name","report_name","page_number","generated_by","generated_date","generated_time","tbl_hrd","alt_clr","show_border","letter_header","letter_footer","filter_option"],"page_orientation":"P","paper_size":"A4","font":"helvetica","font_size":"8","margins":["40","10","40","10"],"tbl_border_wdth":"0.5px","tbl_padding":"5"}};
    let ua_data_length = (Object.keys(ua_data).length);
    var col_width_name_list_temp = [];
    console.log("ua_data");
    console.log(ua_data);
    console.log(default_col_width);
    console.log(default_display_columns);
    console.log(text_alignment);
    console.log(to_be_hidden);
    //return false;
    let option = "";
    $(".pred_date_sel_wrap").remove();
    if(default_col_width.length > 0)
    {

    }
    //return false;
    if(ua_data != 'null' && ua_data != 'false' && ua_data_length > 0)
    {
       // ua_data = JSON.parse(ua_data);
       //console.log(ua_data);
       // $(".search_product").val(ua_data['product_name']);
       // $(".branch_id").val(ua_data['branch_id']);
       // console.log($(".branch_id").next(".select-styled"));
       // $(".branch_id").next(".select-styled").html($(".branch_id option:selected" ).text());
       //console.log(predefined_date_selection);
       if(ua_data['print_preferences'] != undefined &&  ua_data['print_preferences'] != null && ua_data['print_preferences'] != "")
       {
          let display_details = ua_data['print_preferences']['display_details'];
            $(".display_details").each(function(){
              if($.inArray($(this).data('identi'), display_details) !== -1)//avail in the in_array
                $(this).attr('checked',true);
              else
                $(this).attr('checked',false);   
            });
            $(".paper_size").each(function(){
                let size = $(this).data('size');
                if(size == ua_data['print_preferences']['paper_size'])
                $(this).attr('checked',true); 
            });
            $(".page_orientation").each(function(){
                let orientation = $(this).data('orientation');
                if(orientation == ua_data['print_preferences']['page_orientation'])
                $(this).attr('checked',true); 
            });
            let margins = ua_data['print_preferences']['margins'];
            $('.top_margin').val(margins[0]);
            $('.bottom_margin').val(margins[2]);
            $('.left_margin').val(margins[3]);
            $('.right_margin').val(margins[1]);
            let font_name      = ua_data['print_preferences']['font'];
            let font_size      = ua_data['print_preferences']['font_size'];
            let border_width   = ua_data['print_preferences']['tbl_border_wdth'];
            let tbl_padding    = ua_data['print_preferences']['tbl_padding'];
            // console.log($(".drop.font_list"));
            $("body").data('font_name',font_name);

            $(".drop li").removeClass('selected');
            $(".border_drop li").removeClass('selected');
            $(".padding_drop li").removeClass('selected');
            $(".drop li").each(function(){
                // console.log($(this).find('a').text());
                if($(this).find('a').text() == font_size)
                {
                    $(this).addClass('selected');
                    $(this).trigger('click');
                }
            });
            $(".border_drop li").each(function(){
                if($(this).find('a').text() == border_width)
                {
                    $(this).addClass('selected');
                    $(this).trigger('click');
                }
            });
            $(".padding_drop li").each(function(){
                if($(this).find('a').text() == tbl_padding)
                {
                    $(this).addClass('selected');
                    $(this).trigger('click');
                }
            });
            
            // $(".font_list").append('<li class ="selected"><a href="">'+font+'</a></li>');
            // let paper_size       = $(".paper_size:checked").data('size');
            // let page_orientation = $(".page_orientation:checked").data('orientation');
            // let font             = $(".selection_icon_span").text();
            // let font_size        = $(".font_size_span").text();
            // let margins          = [$(".top_margin").val(),$(".right_margin").val(),$('.bottom_margin').val(),$(".left_margin").val()];
       }
       if(ua_data['removed_column_list'] != undefined &&  ua_data['removed_column_list'] != null && ua_data['removed_column_list'] != "")
       {
            //console.log();
            //console.log(removed_column_list_temp);
            let removed_column_list_temp  = ua_data['removed_column_list'];
            let selected_column_name_temp = "";
            $.each(removed_column_list_temp,function(index,each_column_list_temp){
                $(".selected_columns_wrapper .sub_item").each(function(){
                    selected_column_name_temp = $(this).find('p').text();
                    selected_column_name_temp = $.trim(selected_column_name_temp);
                    if(each_column_list_temp == selected_column_name_temp)
                    {
                        $(this).addClass('active');
                        $(".move_to_removed").trigger('click');
                    }
                });
            });
       }
       if(ua_data['predefined_date'] === undefined || ua_data['predefined_date'].toLowerCase() == "custom range")
       {
            selected_range_arr = (predefined_date_selection['Today']);
            cb1(selected_range_arr[0],selected_range_arr[1]);
            cb(selected_range_arr[0],selected_range_arr[1]);
            $(".daterangepicker").eq(1).find('.ranges').find("li").eq(0).trigger('click');
            $(".daterangepicker").eq(0).find('.ranges').find("li").eq(0).trigger('click');
       }
       else
       {
            $(".daterangepicker").find("li").each(function(){
                if($(this).data('range-key') == ua_data['predefined_date'])
                {
                   selected_range_arr = (predefined_date_selection[$(this).data('range-key')]);
                    // console.log(selected_range_arr);
                   // cb(selected_range_arr[0],selected_range_arr[1]);
                   cb1(selected_range_arr[0],selected_range_arr[1]);
                   cb(selected_range_arr[0],selected_range_arr[1]);
                   $(this).trigger('click');
                }
            });
       }
       //return false;
       // console.log("ua_data['filter_setings_data']");
       // console.log(ua_data['filter_setings_data']);
       if(ua_data['filter_setings_data'] !== undefined && ua_data['filter_setings_data'] !== null && ua_data['filter_setings_data'].length > 0)
       {
        // console.log('I am inside');
            // console.log(ua_data['filter_setings_data']);
            $.each(ua_data['filter_setings_data'],function(index,each_filter_settings)
            {
                if(each_filter_settings['filter_type'] == 'date' && each_filter_settings['selected_value'].toLowerCase() !="custom range")
                {
                    $(".daterangepicker").find("li").each(function(){
                        if($(this).data('range-key') == each_filter_settings['selected_value'])
                        {
                           selected_range_arr = (predefined_date_selection[$(this).data('range-key')]);
                           cb1(selected_range_arr[0],selected_range_arr[1]);
                           $(this).trigger('click');
                        }
                    });
                }
                if(each_filter_settings['filter_type'] == 'branch')
                {
                    // console.log('I am inside too');
                    // console.log(each_filter_settings['selected_value']);
                    // if(each_filter_settings['selected_value'] == "")
                    //  $(".branch_id").val("all_branches")
                    // else
                    // console.log('I am here madam');
                    if(each_filter_settings['selected_value'] == "")
                        $(".branch_id").val("all_branches");
                    else
                    {
                        $(".branch_id").val(each_filter_settings['selected_value']);
                        $(".branch_id").siblings(".select-options").find('li').each(function(){
                            console.log($(this).text());
                            console.log(each_filter_settings['selected_value']);
                            if($(this).attr('rel') == each_filter_settings['selected_value'])
                            {
                                $(this).addClass('recent_select');
                            }
                        });
                    }    
                        
                    $(".branch_id").next(".select-styled").html($(".branch_id option:selected" ).text());
                }
                if(each_filter_settings['filter_type'] == 'multi_select')
                {
                    console.log(each_filter_settings);
                    //return false;
                    let split_multi_val = '';
                    $(".filter_item.multi_filter_item").each(function(){
                        if($(this).data('connected_to') == each_filter_settings['connected_to'])
                        {
                            if(each_filter_settings['selected_value'] != "")
                            {
                                split_multi_val = each_filter_settings['selected_value'].split(',');
                                console.log(split_multi_val);
                                $(this).val(split_multi_val).trigger("change");
                            }
                            else
                            {
                                //text_tmp = $(this).find("option:selected").text();
                                $(this).val($(this).find("option:first").attr('selected','selected'));
                                //$(this).next(".select-styled").html(text_tmp);
                            }
                        }
                    });
                }
                if(each_filter_settings['filter_type'] == 'select')
                {
                    let text_tmp = "";
                    $(".filter_item").each(function(){
                        if($(this).data('connected_to') == each_filter_settings['connected_to'])
                        {
                            //console.log(each_filter_settings['selected_value']);
                            if(each_filter_settings['selected_value'] == "")
                            {
                                text_tmp = $(this).find("option:selected").text();
                                $(this).val($(this).find("option:first").attr('selected','selected'));
                                $(this).next(".select-styled").html(text_tmp);
                            }   
                            else
                            {
                                $(this).val(each_filter_settings['selected_value']);
                                $(this).next(".select-styled").html($(this).find("option:selected").text());
                                $(this).siblings(".select-options").find('li').each(function(){
                                    console.log($(this).text());
                                    console.log(each_filter_settings['selected_value']);
                                    if($(this).attr('rel') == each_filter_settings['selected_value'])
                                    {
                                        $(this).addClass('recent_select');
                                    }
                                });
                                // $(this).next(
                                // #119bde29
                            }   
                        }
                    });
                }
                if(each_filter_settings['filter_type'] == 'textbox')
                {
                    $(".filter_item").each(function(){
                        if($(this).data('connected_to') == each_filter_settings['connected_to'] && $(this).data('condition') == each_filter_settings['condition'])
                        {
                            console.log(each_filter_settings['connected_to']);
                            $(this).val("");
                            $(this).data('selected_value',each_filter_settings['selected_value'])
                            $(this).val(each_filter_settings['selected_text']);
                            
                        }
                    });
                }
                if(each_filter_settings['filter_type'] == 'checkbox')
                {
                    $(".filter_item").each(function(){
                        if($(this).data('connected_to') == each_filter_settings['connected_to'] && $(this).data('condition') == each_filter_settings['condition'])
                        {
                            // console.log($(this));
                            // console.log(each_filter_settings['selected_value']);
                            if(each_filter_settings['selected_value'] == '1' || each_filter_settings['selected_value'] == 1)
                            {
                                console.log($(this));
                                $(this).attr('checked',true);
                            }    
                            else
                            {
                                // $(this).attr('checked',false);
                            }    
                                
                        }
                    });
                }
            });
       }
       //return false;
       //$(".submit_report").trigger('click');
    }
    else
    {
        console.log('in else');
        selected_range_arr = (predefined_date_selection['Today']);
        console.log(selected_range_arr);
        cb1(selected_range_arr[0],selected_range_arr[1]);
        cb(selected_range_arr[0],selected_range_arr[1]);
        $(".daterangepicker").eq(1).find('.ranges').find("li").eq(0).trigger('click');
        $(".daterangepicker").eq(0).find('.ranges').find("li").eq(0).trigger('click');
        // $(".report_properties").trigger('click');
    }
    if(default_display_columns.length > 0)
    {
        // console.log(default_col_width);
        // console.log(ua_data['removed_column_list']);
        $(".selected_columns_wrapper .sub_item").each(function(){
            selected_column_name_temp = $(this).find('p').text();
            selected_column_name_temp = $.trim(selected_column_name_temp);
            // console.log(selected_column_name_temp);
            if(selected_column_name_temp in default_col_width)
            {
                // console.log(default_col_width[selected_column_name_temp]);
                $(this).find('.table_col_width').val(default_col_width[selected_column_name_temp]);
            }
            if($.inArray(selected_column_name_temp, default_display_columns) == -1)//Not available in default column
            {
                found_indx = col_width_name_list_temp.indexOf(selected_column_name_temp);
                if(found_indx == -1)
                {
                    if(ua_data['removed_column_list'] != undefined &&  ua_data['removed_column_list'] != null && ua_data['removed_column_list'] != "")
                    {
                        if(ua_data['removed_column_list'].indexOf(selected_column_name_temp) > -1)
                        {
                            $(this).addClass('active');
                            $(".move_to_removed").trigger('click');   
                        }
                    }
                    else
                    {
                        $(this).addClass('active');
                        $(".move_to_removed").trigger('click');           
                    }
                    
                }
            }
        });
    }
    if(ua_data != 'null' && ua_data != 'false' && ua_data_length > 0)
    {
        if(ua_data['col_width_list1'] != undefined &&  ua_data['col_width_list1'] != null && ua_data['col_width_list1'] != "")
        {
            col_width_name_list_temp = ua_data['col_width_name_list'];
            let col_width_list_temp      = ua_data['col_width_list1'];
            let temp_col_name = "";
            let found_indx = "";
            $(".selected_columns_wrapper .sub_item").each(function(){
                temp_col_name = $.trim($(this).find('p').text());
                // console.log(temp_col_name);
                found_indx = col_width_name_list_temp.indexOf(temp_col_name);
                // console.log(found_indx);
                if(found_indx != -1)
                {
                    // console.log(col_width_list_temp[found_indx]);
                    $(this).find('.table_col_width').val(col_width_list_temp[found_indx]);
                    //default_col_width[temp_col_name] = col_width_list_temp[found_indx]
                }
            });
        }
    }
    to_be_hidden = to_be_hidden.split(",");
    $(".removed_columns_wrapper .sub_item").each(function(){
        selected_column_name_temp = $(this).find('p').text();
        selected_column_name_temp = $.trim(selected_column_name_temp);
        // console.log(selected_column_name_temp);
        // console.log(to_be_hidden)
        // console.log(selected_column_name_temp);
        if($.inArray(selected_column_name_temp, to_be_hidden) != -1)
        {
            // console.log(default_col_width[selected_column_name_temp]);
            $(this).addClass('invisibl');
        }
    });
    // to_be_hidden
    $(".report_properties").trigger('click');
    $(".btn_cancel").click(function(){
        $(".close-popup").trigger('click');
    });
    $("body").on("click",".side_reports",function(){
        let report_slug = $(this).data('slug');
        let parent_length = $(this).parents('.report_holder').length;
        if(parent_length == 1)
        {
            $(".report_holder").find('.popup-content').empty();
            $(".each_report").each(function(){
                if($(this).data('slug') == report_slug)
                {
                    $(this).trigger('click');
                }
            });
        }
        else
        {
            let url = base_url + "/" + "reports/generate/"+report_slug
            var win = window.open(url, '_blank');
            win.focus();
        }
        console.log(parent_length);
    });
    let search_items = new Bloodhound({
        datumTokenizer: function(datum) {
            // console.log('I am called');
            return Bloodhound.tokenizers.whitespace(datum.value);
        },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
            remote: {
                //wildcard: '%QUERY',
                url: base_url+"reports/fetch_item_with_hinds",
                prepare:function(query, settings)
                {
                    $('.notify').remove();
                    //$('.search_product').removeClass('invalid');
                    // $('.auto_complete_filter.active_typeahead').parent('.twitter-typeahead').
                    // siblings('.spin_loader').removeClass('invisibl');
                    
                    hint_join   = $('.auto_complete_filter.active_typeahead').data('hint_join');
                    hint_where   = $('.auto_complete_filter.active_typeahead').data('hint_where');
                    connected_to = $('.auto_complete_filter.active_typeahead').data('abs_connected_to');
                    return_value = $('.auto_complete_filter.active_typeahead').data('return_value');
                    if(hint_join == "" || hint_join == undefined)hint_join = '1';
                    if(hint_where == "" || hint_where == undefined)hint_where = '1';
                    if(connected_to == "" || connected_to == undefined)
                      connected_to = $('.auto_complete_filter.active_typeahead').data('connected_to');
                    // console.log(return_value);
                    report_name  = $('.auto_complete_filter.active_typeahead').data('report_name');
                    sub_name     = $('.auto_complete_filter.active_typeahead').data('sub_name');
                    if(sub_name == "" || sub_name == null || sub_name == undefined)sub_name = "zz";
                    if(return_value == "" || return_value == null || return_value == undefined)return_value = "xx";
                    settings.url = this.url + "/" + report_name + "/" + connected_to + "/" + sub_name + "/" + hint_where + "/" +return_value+ "/" + hint_join + "/" +query;
                    return settings;
                },
                transform: function(response) {
                    console.log(response);
                    console.log(response.length);
                     $('.notify').remove();
                    // $('.notify').remove();
                    // $(".spin_loader").addClass('invisibl');
                    if(response != null && response.length > 0)
                    {
                        // console.log('I am inside man');
                        // console.log(response['customer_input']);
                        // let customer_input = response[0]['customer_input'];
                        // let splits = customer_input.split(".");
                        // console.log(splits);
                        return $.map(response, function(search_result) {
                            return {return_value:search_result['return_value'],value: search_result['customer_input'] };
                        }); 
                    }
                    else
                    {
                        //$('.search_product').addClass('invalid');
                        $('.auto_complete_filter.active_typeahead').after('<label class="notify" style="    font-size: 13px;color: red;">Not Found!...</label>');
                    }
                }
            }
    });
    $('.auto_complete_filter').on('typeahead:selected', function (e, datum) {
        console.log(datum);
        if(datum['return_value'] != "")
            $(this).data('selected_value',datum['return_value']);
        else
            $(this).data('selected_value',datum['value']);
        // $('#item_code').val(datum.item_code);
    });
    $("body").on("click",".refresh_report",function(){
        $(".submit_report").trigger('click');
    });
    $('.auto_complete_filter').keydown(function(){
        $('.auto_complete_filter').removeClass('active_typeahead');
        $(this).addClass('active_typeahead');
    });
    var auto_complete_filter = $('.auto_complete_filter').typeahead({
        hint: false,
        highlight: true,
        minLength: 1,
    },
    {
        name: 'Search_items',
        display: 'value',
        source: search_items,
        limit: "Infinity"
    });
    let param_array = '[]';
    let indirect_open = 0;
    // console.log(indirect_open);
    // return false;
    param_array = JSON.parse(param_array);
    console.log(param_array);
    let br_sel= '';
    $.each(param_array,function(identifier,val){
        switch(identifier)
        {
            case 'b': //branch
                $(".branch_id").val(val['branch_id']);
                $(".branch_id").change().click();
                br_sel = $(".branch_id option:selected").text();
                $("select.branch_id").siblings('.select-styled').text(br_sel);
            break;
            case 'd':  //date
                // let para_dates = para_date.split("&");
                let from_date  = val['from_date'].split('-');
                let to_date    = val['to_date'].split('-');
                let  date1 = new Date(from_date[2]+'-'+from_date[1]+'-'+from_date[0]);//Year-Month-date
                date1 = moment(date1).set({"hour": working_time_start_tf_sp[0], "minute": working_time_start_tf_sp[1]});
                // date1 = moment(date1);
                let  date2 = new Date(to_date[2]+'-'+to_date[1]+'-'+to_date[0]);
                date2 = moment(date2).set({"hour": working_time_end_tf_sp[0], "minute": working_time_end_tf_sp[1]});
                // date2 = moment(date2);
                cb1(date1,date2);  
            break;
            case 'filter_item': //filters
            let fiter_item_identifier = '';
            let filter_index = '';
            let multi_split_val = '';
                $.each(param_array['filter_item'],function(filter_index,each_filter){
                    filter_index = Number(each_filter['fiter_item_identifier'].substring(1)) - 1;
                    console.log($(".filter_item").eq(filter_index));
                    switch(each_filter['control_identifier'])
                    {
                        case 'auto_select':
                            fiter_item_identifier = each_filter['fiter_item_identifier'];
                            $(".filter_item").eq(filter_index).val(each_filter['text']).focus();
                            $(".filter_item").eq(filter_index).data('selected_value',each_filter['id']);
                            setTimeout(function(){
                                $('.tt-selectable').first().click();
                            },1000);
                        break;
                        case 'select':
                            fiter_item_identifier = each_filter['fiter_item_identifier'];                       
                            $(".filter_item").eq(filter_index).val(each_filter['id']);
                            $(".filter_item").eq(filter_index).change().click();
                            br_sel = $(".filter_item").eq(filter_index).find("option:selected").text();
                            $(".filter_item").eq(filter_index).siblings('.select-styled').text(br_sel);
                        break;
                        case 'multi_select':
                            fiter_item_identifier = each_filter['fiter_item_identifier'];
                            multi_split_val = each_filter['id'].split('&');
                            console.log('multi_select caught');
                            console.log(multi_split_val);
                            $(".filter_item").eq(filter_index).val(multi_split_val);
                            $(".filter_item").eq(filter_index).change().click();
                        break;
                        case 'checkbox':
                            console.log('checkbox caught');
                            fiter_item_identifier = each_filter['fiter_item_identifier'];
                            if(each_filter['text'] == '1' || each_filter['text'] == 1)
                                $(".filter_item").eq(filter_index).attr('checked',true);
                        break;
                    }
                });
            break;
        }
        // console.log(index);
        // console.log(val);
    });
    console.log("param_array");
    console.log(param_array);
    if(Object.keys(param_array).length > 0)
    {
        $(".submit_report").trigger('click');
    }
    // console.log("param_array");
    // console.log(param_array);

});  

if ($('.external_click_script').length === 0) {
    $("body").on("click",".column_external_link",function(e){
    // $(".column_external_link").click(function(e){
        e.preventDefault();
        e.stopPropagation();
        console.log('td clicked1');
        let linkk = $(this).attr('href');
        console.log({linkk});
        var win = window.open(linkk, '_blank','toolbar=yes,location=no,resizable=yes,top=100,left=50,width=1300,height=800');
        if (win)
        {
            //Browser has allowed it to be opened
            win.focus();
        }
        else
        {
            //Browser has blocked it
            alert('Please allow popups for this website');
        }
    });
//     let custom_external_click_script = `$("body").on("click",".column_external_link",function(e){
//     // $(".column_external_link").click(function(e){
//     e.preventDefault();
//     e.stopPropagation();
//     console.log('td clicked');
//     let linkk = $(this).attr('href');
//     console.log({linkk});
//     var win = window.open(linkk, '_blank','toolbar=yes,location=no,resizable=yes,top=100,left=50,width=1300,height=800');
//     if (win)
//     {
//         win.focus();
//         const timer = setInterval(() => {
//             if (win.closed) {
//             clearInterval(timer);
//             $(".submit_report").trigger("click");
//             }
//         }, 500);
//     }
//     else
//     {
//         //Browser has blocked it
//         alert('Please allow popups for this website');
//     }
// });`;
//     $('<script>')
//     .attr('class', 'external_click_script')
//     .prop('type', 'text/javascript')
//     .html(custom_external_click_script);

}
</script>
Request URL
https://beta.aipsoft.com/inout/reports/getTableColumns
Request Method
POST
report_name
unpaid_sales_invoices
[["SI Id","Ord Id","Branch","Invoice#","Order#","Ref#","Billing Date","Billing Time","Order Date","Order Time","Invoiced Staff","Ordered Staff","Salesman","Cust-Mobile","Customer Name","Order Type","Gross Amount","Discount","VAT","Round Off","Vatable Amount","Net Sale Amount","Paid Amount","Balance","Payment Info","Payment","Remark","Status","Driver"],{"Gross Amount":"ROUND(IF(SI.id IS NOT NULL,SI.total_amount+SI.tax_amount,O.total_amount+O.tax_amount),4)","Discount":"ROUND(IF(SI.id IS NOT NULL,SI.p_discount+SI.discount,O.p_discount+O.discount),4)","VAT":"ROUND(IF(SI.id IS NOT NULL,SI.tax_amount,O.tax_amount),4)","Round Off":"ROUND(IF(SI.id IS NOT NULL,SI.round_off,O.round_off),4)","Vatable Amount":"ROUND(IF(SI.id IS NOT NULL,SI.total_amount-SI.p_discount,O.total_amount-O.p_discount),4)","Net Sale Amount":"ROUND(IF(SI.id IS NOT NULL,SI.grand_total,O.grand_total),4)","Paid Amount":"ROUND(IF(SI.id IS NOT NULL,SI.received_amount,O.received_amount),4)","Balance":"ROUND(IF(SI.id IS NOT NULL,SI.grand_total-SI.received_amount,O.grand_total-O.received_amount),2)"}]
----------------------------------------------
Request URL
https://beta.aipsoft.com/inout/reports/generate_report
Request Method
POST
draw=1&columns%5B0%5D%5Bdata%5D=0&columns%5B0%5D%5Bname%5D=&columns%5B0%5D%5Bsearchable%5D=true&columns%5B0%5D%5Borderable%5D=true&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=1&columns%5B1%5D%5Bname%5D=&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=true&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=2&columns%5B2%5D%5Bname%5D=&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=true&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=3&columns%5B3%5D%5Bname%5D=&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=true&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=4&columns%5B4%5D%5Bname%5D=&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=true&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5Bdata%5D=5&columns%5B5%5D%5Bname%5D=&columns%5B5%5D%5Bsearchable%5D=true&columns%5B5%5D%5Borderable%5D=true&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B6%5D%5Bdata%5D=6&columns%5B6%5D%5Bname%5D=&columns%5B6%5D%5Bsearchable%5D=true&columns%5B6%5D%5Borderable%5D=true&columns%5B6%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B6%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B7%5D%5Bdata%5D=7&columns%5B7%5D%5Bname%5D=&columns%5B7%5D%5Bsearchable%5D=true&columns%5B7%5D%5Borderable%5D=true&columns%5B7%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B7%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B8%5D%5Bdata%5D=8&columns%5B8%5D%5Bname%5D=&columns%5B8%5D%5Bsearchable%5D=true&columns%5B8%5D%5Borderable%5D=true&columns%5B8%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B8%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B9%5D%5Bdata%5D=9&columns%5B9%5D%5Bname%5D=&columns%5B9%5D%5Bsearchable%5D=true&columns%5B9%5D%5Borderable%5D=true&columns%5B9%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B9%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B10%5D%5Bdata%5D=10&columns%5B10%5D%5Bname%5D=&columns%5B10%5D%5Bsearchable%5D=true&columns%5B10%5D%5Borderable%5D=true&columns%5B10%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B10%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B11%5D%5Bdata%5D=11&columns%5B11%5D%5Bname%5D=&columns%5B11%5D%5Bsearchable%5D=true&columns%5B11%5D%5Borderable%5D=true&columns%5B11%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B11%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B12%5D%5Bdata%5D=12&columns%5B12%5D%5Bname%5D=&columns%5B12%5D%5Bsearchable%5D=true&columns%5B12%5D%5Borderable%5D=true&columns%5B12%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B12%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B13%5D%5Bdata%5D=13&columns%5B13%5D%5Bname%5D=&columns%5B13%5D%5Bsearchable%5D=true&columns%5B13%5D%5Borderable%5D=true&columns%5B13%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B13%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B14%5D%5Bdata%5D=14&columns%5B14%5D%5Bname%5D=&columns%5B1Show more
{"draw":"1","recordsTotal":10,"recordsFiltered":844,"report_actual_name":"Unpaid Sales Invoices","report_columns":"SI.id AS SI_id, O.id AS O_id, BR.branch_code, SI.order_no AS invoice_no, O.order_no, IF(SI.invoice_remark1 IS NOT NULL AND SI.invoice_remark1 != \"\", SI.invoice_remark1,O.invoice_remark1) AS ref, DATE_FORMAT(SI.billing_date,\"%d-%m-%Y\") AS invoice_billing_date, TIME_FORMAT(SI.billing_time,\"%r\") AS invoice_billing_time, DATE_FORMAT(O.order_date,\"%d-%m-%Y\") AS order_billing_date, TIME_FORMAT(O.billing_time,\"%r\") AS order_billing_time, INV_USR_HEAD.acc_name1 AS invoiced_user, ORD_USR_HEAD.acc_name1 AS ordered_user, IF(SI.id IS NOT NULL,INV_SALES_HEAD.acc_name1,ORD_SALES_HEAD.acc_name1) AS salesman, IF(SI.id IS NOT NULL,SI.customer_mobile,O.customer_mobile) AS cust_mobile, IF(SI.id IS NOT NULL,SI.customer_name,O.customer_name) AS cust_name, IF(O.id IS NOT NULL, CONCAT(\"Order- \",DTYPE.text), DTYPE.text) AS delivery_type, ROUND(IF(SI.id IS NOT NULL,SI.total_amount+SI.tax_amount,O.total_amount+O.tax_amount),2) AS gross_amount, ROUND(IF(SI.id IS NOT NULL,SI.p_discount+SI.discount,O.p_discount+O.discount),2) AS discount, ROUND(IF(SI.id IS NOT NULL,SI.tax_amount,O.tax_amount),2) AS tax_amount, ROUND(IF(SI.id IS NOT NULL,SI.round_off,O.round_off),2) AS round_off, ROUND(IF(SI.id IS NOT NULL,SI.total_amount-SI.p_discount,O.total_amount-O.p_discount),2) AS vatable_amount, ROUND(IF(SI.id IS NOT NULL,SI.grand_total,O.grand_total),2) AS grand_total, ROUND(IF(SI.id IS NOT NULL,SI.received_amount,O.received_amount),2) AS paid_amount, ROUND(IF(SI.id IS NOT NULL,SI.grand_total-SI.received_amount,O.grand_total-O.received_amount),2) AS balance_amount,CONCAT(IF((SELECT GROUP_CONCAT(\"Advance with \",payment_method,\": \",ROUND(amount,2),\"\") FROM aip_payment_history WHERE sale_order_id = O.id AND status = \"1\" GROUP BY sale_order_id) IS NOT NULL,(SELECT GROUP_CONCAT(\"Advance with \",payment_method,\": \",ROUND(amount,2),\"\") FROM aip_payment_history WHERE sale_order_id = O.id AND status = \"1\" GROUP BY sale_order_id),\"\\n\"),IF((SELECT GROUP_CONCAT(\"Paid with \",payment_method,\": \",ROUND(amount,2),\"\") FROM aip_payment_history WHERE order_id = SI.id AND status = \"1\" GROUP BY order_id) IS NOT NULL,(SELECT GROUP_CONCAT(\"Paid with \",payment_method,\": \",ROUND(amount,2),\"\\n\") FROM aip_payment_history WHERE order_id = SI.id AND status = \"1\" GROUP BY order_id),\"\")) AS payment_info,CONCAT(IF((SELECT GROUP_CONCAT(\"Advance \",payment_method,\",\") FROM aip_payment_history WHERE sale_order_id = O.id AND status = \"1\" GROUP BY sale_order_id) IS NOT NULL,(SELECT GROUP_CONCAT(\"Advance \",payment_method,\",\") FROM aip_payment_history WHERE sale_order_id = O.id AND status = \"1\" GROUP BY sale_order_id),\"\\n\"),IF((SELECT GROUP_CONCAT(\"Paid \",payment_method) FROM aip_payment_history WHERE order_id = SI.id AND status = \"1\" GROUP BY order_id) IS NOT NULL,(SELECT GROUP_CONCAT(\"Paid \",payment_method) FROM aip_payment_history WHERE order_id = SI.id AND status = \"1\" GROUP BY order_id),\"\")) AS payment_mode,SI.invoice_remark2,CASE WHEN SI.id IS NOT NULL AND SI.order_status = \"0\" THEN \"Active Invoice\" WHEN SI.id IS NOT NULL AND SI.order_status = \"1\" THEN \"Processing\" WHEN SI.id IS NOT NULL AND SI.order_status = \"2\" THEN \"Completed\" WHEN SI.id IS NOT NULL AND SI.order_status = \"3\" THEN \"Delivered\" WHEN SI.id IS NOT NULL AND SI.order_status = \"4\" THEN \"Cancelled\" WHEN SI.id IS NOT NULL AND SI.order_status = \"5\" THEN \"Partially Delivered\" WHEN SI.id IS NULL AND O.order_status = \"0\" THEN \"Active Order\" WHEN SI.id IS NULL AND O.order_status = \"1\" THEN \"Order Processing\" WHEN SI.id IS NULL AND O.order_status = \"2\" THEN \"Completed\" WHEN SI.id IS NULL AND O.order_status = \"3\" THEN \"Delivered\" WHEN SI.id IS NULL AND O.order_status = \"4\" THEN \"Order Cancelled\" WHEN SI.id IS NULL AND O.order_status = \"5\" THEN \"Partially Delivered\" WHEN SI.id IS NULL AND O.order_status = \"6\" THEN \"Order Merged\" ELSE \"-\" END AS order_status, IF(SI.driver_id > 0,DRV_HEAD.acc_name1,\"\") AS driver_name","summable_column":{"Gross Amount":"158,797.02","Discount":"0.00","VAT":"7,585.87","Round Off":"-0.07","Vatable Amount":"151,211.15","Net Sale Amount":"158,797.30","Paid Amount":"139,541.69","Balance":"19,255.61"},"row_link_arr":["https:\/\/beta.aipsoft.com\/inout\/sales_invoice\/indr\/317290\/view","https:\/\/beta.aipsoft.com\/inout\/sales_invoice\/indr\/317291\/view","https:\/\/beta.aipsoft.com\/inout\/sales_invoice\/indr\/317295\/view","https:\/\/beta.aipsoft.com\/inout\/sales_invoice\/indr\/317296\/view","https:\/\/beta.aipsoft.com\/inout\/sales_invoice\/indr\/317300\/view","https:\/\/beta.aipsoft.com\/inout\/sales_invoice\/indr\/317309\/view","https:\/\/beta.aipsoft.com\/inout\/sales_invoice\/indr\/317317\/view","https:\/\/beta.aipsoft.com\/inout\/sales_invoice\/indr\/317329\/view","https:\/\/beta.aipsoft.com\/inout\/sales_invoice\/indr\/317333\/view","https:\/\/beta.aipsoft.com\/inout\/sales_invoice\/indr\/317335\/view"],"row_color_arr":["","","","","","","","","",""],"sort_column_return":["0",""],"data":[[1,"AL FALAH","223688","254305","Pack: Fd3,","01-05-2026","12:20:10 PM","01-05-2026","09:48:29 AM","Cash","Cash","Anne","0542220020","khalid mama","Order- PICKUP","27.30","0.00","1.30","0.00","26.00","27.30","0.00","27.30","\n","\n","","Delivered",""],[2,"AL FALAH","223689","252699","Pack: 110,","01-05-2026","12:21:22 PM","19-04-2026","09:42:55 AM","Cash","Cash","Anne","0542220020","khalid mama","Order- PICKUP","38.85","0.00","1.85","0.00","37.00","38.85","0.00","38.85","\n","\n","","Delivered",""],[3,"AL FALAH","223691","250742","","01-05-2026","01:19:05 PM","04-04-2026","08:41:59 PM","Cash","Cash","Anne","0523528197","shamkha ","Order- Home Delivery","91.88","0.00","4.38","0.00","87.50","91.88","0.00","91.88","\n","\n","","Delivered","FIDA "],[4,"AL FALAH","223692","250409","","01-05-2026","01:19:32 PM","02-04-2026","07:08:40 PM","Cash","Cash","Anne","0501305050","arbab naser,  k  little nas","Order- Home Delivery","217.88","0.00","10.38","0.00","207.50","217.88","0.00","217.88","\n","\n","","Delivered",null],[5,"AL FALAH","223695","254152","","01-05-2026","01:34:49 PM","30-04-2026","10:02:34 AM","Cash","Cash","Anne","0542220020","khalid mama","Order- PICKUP","64.05","0.00","3.05","0.00","61.00","64.05","0.00","64.05","\n","\n","","Delivered",""],[6,"AL FALAH","223704","252704","mbk
<\/br>
    Pack: 209,","01-05-2026","03:28:43 PM","19-04-2026","09:59:27 AM","Cash","Cash","Anne","0505334805","khat medium nas","Order- PICKUP","10.50","0.00","0.50","0.00","10.00","10.50","10.00","0.50","\nPaid with Credit-Card: 10.00\n","\nPaid Credit-Card","","Delivered",""],[7,"AL FALAH","223711","253902","Pack: 95,","01-05-2026","04:33:20 PM","28-04-2026","10:05:38 AM","Cash","Cash","Anne","0504466271","m ","Order- PICKUP","42.00","0.00","2.00","0.00","40.00","42.00","0.00","42.00","\n","\n","","Delivered",""],[8,"AL FALAH","223716","252142","MBK<\/br>Pack: Fx4,","01-05-2026","05:00:36 PM","14-04-2026","10:56:26 PM","Cash","Cash","Anne","0559944122"," K NO NAS","Order- PICKUP","4.20","0.00","0.20","0.00","4.00","4.20","0.00","4.20","\n","\n","","Delivered",""],[9,"AL FALAH","223719","251310","MBK, CARPETS THREE","01-05-2026","05:19:43 PM","08-04-2026","09:55:28 PM","Cash","Cash","Anne","0506205225","FAHAMI ","Order- PICKUP","169.16","0.00","8.06","0.00","161.10","169.16","0.00","169.16","\n","\n","","Delivered",""],[10,"AL FALAH","223721","254210","","01-05-2026","05:20:35 PM","30-04-2026","04:56:43 PM","Cash","Cash","Anne","0506205225","FAHAMI ","Order- Home Delivery","24.15","0.00","1.15","0.00","23.00","24.15","0.00","24.15","\n","\n","","Delivered","FIDA "]],"columlink":[]}
