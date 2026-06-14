let user_id               = window.localStorage.getItem('api_user_id');
let api_url               = window.localStorage.getItem('api_url');
client_identifier         = window.localStorage.getItem('client_identifier');
let branch_id             = window.localStorage.getItem('branch_id');
let currency_id           = window.localStorage.getItem('currency_id');
let login_date            = window.localStorage.getItem('login_date');
let login_time            = window.localStorage.getItem('login_time');
let counter_opened_date   = window.localStorage.getItem('counter_opened_date');
let counter_opened_time   = window.localStorage.getItem('counter_opened_time');
let prefix_char;
let currency_short='';
let hostname;
let time_zone;
let page_title;
// alert(user_id+' - '+api_url+' - '+client_identifier+' - '+branch_id+' - '+currency_id+' - '+login_date+' - '+counter_opened_date)
// alert(api_url);
let base_url    = api_url; 
checkRedirect();
function loadErrorPopup(title='Error',content='Try again',hideBtn=0,focus=0,success=0)
{
    //console.log('hideBtn - '+hideBtn)
    $.confirm({
        title: title,
        content: content,
        boxWidth: '50%',
        useBootstrap: false,
        icon: 'fas fa-exclamation-triangle',
        backgroundDismissAnimation: 'glow',
        type: 'red',
        buttons: {
            omg: {
                text: 'Close',
                btnClass: 'btn-red',
                action: function(){
                  if(focus==0)
                    $('.main_entry_fld').val('').trigger('focus');
                  else
                    $('.pc_barcode_scan').val('').trigger('focus');
                }
            }
        },
        onOpenBefore: function () {
          $('.jconfirm').addClass('notFoundClass')
          if(hideBtn=='1')
            $(".jconfirm-buttons").find('button').hide();
          if(success==1)
          {
            $('.notFoundClass .jconfirm-box').removeClass('jconfirm-type-red').addClass('jconfirm-type-green')
            $('.jconfirm .jconfirm-box .jconfirm-buttons button.btn-red').css('background-color','#2ecc71');
          }
        },
        onContentReady: function () {
          if(hideBtn=='1')
            $(".jconfirm-buttons").find('button').hide();
        },
    });
}
$('body').on('click','.power_actions li',function(){
    $('.power_actions li').removeClass('focus');
    $(this).addClass('focus');
    let action = $(this).data('action');
    let confirmTxt = '';
    let btnTxt  = '';
    let ccBtn   = '';
    if(action=='restart')
    {
      confirmTxt = 'Do you really want to Restart the system now.';
      btnTxt     = 'Yes, Restart';
    }
    else if(action=='shutdown')
    {
      confirmTxt = 'Do you really want to Shutdown the system now.';
      btnTxt     = 'Yes, Shutdown';
    }
    else
    {
      confirmTxt = 'Do you really want to Logout now.';
      btnTxt = 'Yes, Logout';
      ccBtn  = '1';
    }
    let ccHtml = '';

    let ask_confirm = 1;
    if(ask_confirm==1)
    {
        if(ccBtn=='1')
        {
            $.confirm({
                title: false,
                boxWidth: '80%',
                useBootstrap: false,
                draggable: true,
                type: 'blue',
                content: '' +
                  '<div class="form-group invoice-found">' +
                  '<h2>Are you sure ?</h2>' +
                  '<p>'+confirmTxt+'</p>'+
                  '</div>',
                type: 'blue',
                buttons: {
                    cancel: {
                        action: function (cancel) {
                          window.top.close();
                        },
                        text: 'No, Cancel'
                          //close
                      },
                      // ccHtml
                      // ccBtn:{
                      //   text: 'Close Counter & Logout',
                      //   btnClass: 'btn-warning',
                      //     action: function () {
                      //       $('.auth_confrmremove_btn').data('action','logout');
                      //       $("#authentication_modal").modal({backdrop: 'static', keyboard: false});
                      //       setTimeout(function(){
                      //         $('#auth_supervisor_pwd').trigger('focus')
                      //       },1000)
                      //     }
                      // },
                      ok:{
                        text: btnTxt,
                        btnClass: 'btn-blue',
                          action: function () {
                            proceedPowerAction(action);
                          }
                      }
                },
                onOpenBefore: function () {
                    // before the modal is displayed.
                    $('.jconfirm').addClass('specClass')
                    $('.jconfirm-buttons').addClass('full-width')
                },
                onContentReady: function () {
                    // bind to events
                   // $('.jconfirm-buttons').addClass('full-width')
                    var jc = this;
                    this.$content.parents('.jconfirm').addClass('jconfirm_custom');
                    this.$content.find('.job_search_txt').on('keyup', function (e) {
                      let val = $(this).val();
                      
                      if(e.which == 13  || e.keyCode == 13)
                      {
                        jc.$$ok.trigger('click');
                      }
                    }); 
                }
            });
        }
        else
        {
            $.confirm({
                title: false,
                boxWidth: '80%',
                useBootstrap: false,
                draggable: true,
                type: 'blue',
                content: '' +
                  '<div class="form-group invoice-found">' +
                  '<h2>Are you sure ?</h2>' +
                  '<p>'+confirmTxt+'</p>'+
                  '</div>',
                type: 'blue',
                buttons: {
                    cancel: {
                        action: function (cancel) {
                          window.top.close();
                        },
                        text: 'No, Cancel'
                          //close
                      },
                      // ccHtml
                      ok:{
                        text: btnTxt,
                        btnClass: 'btn-blue',
                          action: function () {
                            proceedPowerAction(action);
                          }
                      }
                },
                onOpenBefore: function () {
                    // before the modal is displayed.
                    $('.jconfirm').addClass('specClass')
                    $('.jconfirm-buttons').addClass('full-width')
                },
                onContentReady: function () {
                    // bind to events
                    // $('.jconfirm').addClass('specClass')
                    var jc = this;
                    this.$content.parents('.jconfirm').addClass('jconfirm_custom');
                    this.$content.find('.job_search_txt').on('keyup', function (e) {
                      let val = $(this).val();
                      
                      if(e.which == 13  || e.keyCode == 13)
                      {
                        jc.$$ok.trigger('click');
                      }
                    }); 
                }
            });
        }
    }
    else
    {
      proceedPowerAction(action);
    }
})
function proceedPowerAction(action)
{
    if(action=='logout')
    {
        logout();
    }
    else
    { 
      let msg = '';
      if(action=='shutdown')
        msg = 'Your System is Shutting Down in a while...';
      else
        msg = 'Your System is Restarting in a while...';
      loadAjax(1,msg);
        $.ajax({
          url      : base_url+"/pos_api/proceedPowerAction",
          type     : "POST",
          data     : {'action': action},
          success  : function(data){
            //console.log(data);
          }
        });
    }
}
function logout()
{
  // window.localStorage.setItem('api_url','');
  window.localStorage.setItem('api_user_id','');
  // window.localStorage.setItem('client_identifier','');
  window.localStorage.setItem('branch_id','');
  window.localStorage.setItem('currency_id','');
  window.localStorage.setItem('login_date','');
  window.localStorage.setItem('counter_opened_date','');
  window.localStorage.setItem('counter_opened_time','');
  window.location = "index.html";
}
function checkRedirect(){
  let redirect_flag         = 1;
  if(api_url==undefined || api_url=='' || api_url==null)
    redirect_flag         = 0;
  if(user_id ==undefined || user_id =='' || user_id ==null)
    redirect_flag         = 0;
  if(client_identifier==undefined || client_identifier=='' || client_identifier==null)
    redirect_flag         = 0;
  if(branch_id==undefined || branch_id=='' || branch_id==null)
    redirect_flag         = 0;
  if(currency_id==undefined || currency_id=='' || currency_id==null)
    redirect_flag         = 0;
  // if(login_date==undefined || login_date=='' || login_date==null)
  //   redirect_flag         = 0;
  if(redirect_flag==0)
    window.location.replace(`../login.html`);
  else
    LoadSettings();
}
function LoadSettings()
{
   // data = server_details;
    var api_url = window.localStorage.getItem('api_url');
    var client_identifier = window.localStorage.getItem('client_identifier');

   if(api_url != null && client_identifier!= null && client_identifier != '' && api_url != '')
   {

      $('.nav_logo').html('<img src="'+api_url+'/userdatas/clients/'+client_identifier+'/login.png" alt="Image not found" onerror="this.src=\'logo.png\';" />');
      let page_name = document.location.pathname.match(/[^\/]+$/)[0];
      if(page_name=='landing.html')
        LoadGeneralSettings();
      if(page_name=='home_delivery.html'){
        let profile_avatar = window.localStorage.getItem('profile_avatar');
        let profile_name = window.localStorage.getItem('profile_name');
        let profile_type = window.localStorage.getItem('profile_type');
        $('.profile_avatar').attr('src',profile_avatar);
        $('.profile_name').text(profile_name);
        $('.profile_type').text(profile_type);
        LoadPendingOrder();
      }
      if(page_name=='counter_shift.html'){
        let profile_avatar = window.localStorage.getItem('profile_avatar');
        let profile_name = window.localStorage.getItem('profile_name');
        let profile_type = window.localStorage.getItem('profile_type');
        $('.profile_avatar').attr('src',profile_avatar);
        $('.profile_name').text(profile_name);
        $('.profile_type').text(profile_type);
        LoadCounterData();
      }
      // if(page_name=='packing.html')
      //   LoadPackingDetails();
      // if(page_name=='customer-orders.html')
      //   LoadCustomerOrderDetails();
   }
   else
   {
      let title = 'Alert.. !';
      let content = 'Error in Loading, Please contact Software Support.';
      loadErrorPopup(title,content,'1')
   }
      
}
function removeAjaxLoad()
{
  $('.loading').remove();
  // setTimeout(function(){ $('.loading').remove();},100);
}
function loadAjax(mode=0,msg="")
{
  let msgTxt = '';
  if(mode==1)
    msgTxt = '<p class="powerMsg">'+msg+'</p>';
  $('body').append("<div class='loading'>"+msgTxt+"<i class='fa fa-spinner fa-pulse fa-3x fa-fw'></i></div>");
  // $('.loading').removeClass('invisibl');
}
function logout()
{
  // window.localStorage.setItem('api_url','');
  window.localStorage.setItem('api_user_id','');
  // window.localStorage.setItem('client_identifier','');
  window.localStorage.setItem('branch_id','');
  window.localStorage.setItem('currency_id','');
  window.localStorage.setItem('login_date','');
  window.localStorage.setItem('counter_opened_date','');
  window.localStorage.setItem('counter_opened_time','');
  window.location = "../login.html";
}
function RoundNum(num, length) { 
    //let number = Math.round(num * Math.pow(10, length)) / Math.pow(10, length);
    let number = (Math.round( num * 100 ) / 100).toFixed(length);
    return number;
}
function LoadGeneralSettings(reload=true)
{
  if(reload)
    loadAjax();
    $.ajax({
        url: base_url+'/pos_api/getDeliveryData',
        method: 'POST',
        data: {'client_identifier': client_identifier,'branch_id':branch_id,'user_id':user_id},
        dataType : "JSON",
        success: function(data) 
        {
          removeAjaxLoad();
          $('.valid_input').val('');
          if(data.status==1)
          {
            let response = data.data;
              if(Object.keys(response).length > 0)
              {
                currency_short = response.currency_short;
                no_of_decimals = response.no_of_decimals;
                $('.profile_avatar').attr('src',response.profile_path);
                $('.profile_name').text(response.acc_name1);
                $('.profile_type').text(response.user_type_name);
                localStorage.setItem("profile_avatar",response.profile_path);
                localStorage.setItem("profile_name",response.acc_name1);
                localStorage.setItem("profile_type",response.user_type_name);
                localStorage.setItem("currency_short",currency_short);
                localStorage.setItem("no_of_decimals",no_of_decimals);

                localStorage.setItem("shift_id",response.shift_id);
                localStorage.setItem("keep_driver_shift_separately",response.keep_driver_shift_separately);
                localStorage.setItem("disable_shift_opening_closing_from_driver_app",response.disable_shift_opening_closing_from_driver_app);
                // $('.profile_logged').text('Counter Opened @ '+login_date+' '+login_time);
                // $('.profile_branch').text(response.branch_city);

                //---------------INITIAL SETUPS STARTS --------------------------------------//
                time_zone      = response.time_zone;
                page_title     = response.page_title;
                hostname       = response.domain;
                localStorage.setItem("hostname",hostname);
                localStorage.setItem("page_title",page_title);
                localStorage.setItem("time_zone",time_zone);
                upload_baseurl = response.upload_baseurl;
                abs_url        = response.abs_url;
                tax_inclusive  = response.tax_included;
                tax_inclusive  = 1;
                client_identifier = response.client_identifier;
                order_prefix   = response.order_prefix;
                prefix_char    = response.order_prefix;
                inv_auto_count_length   = response.inv_auto_count_length;
                bill_data = response.bills;
                complete_payment_method = response.complete_payment_method;
                let collection_data = response.shift_collection;
            
                let total_bills = 0;
                let delivered_bills = 0;
                
                if (bill_data.length > 0) {
                  bill_data.forEach(function(bill, i) 
                  {
                    let status = bill.status;
                    let invoice_id = bill.invoice_id;
                    if (status == 0 && invoice_id != 0) {
                      total_bills = Number(total_bills) + 1;
                    }
                    if (status == 1 && invoice_id != 0) {
                      total_bills = Number(total_bills) + 1;
                      delivered_bills = Number(delivered_bills) + 1;
                    }
                  })
                }
                let payment_types = ``; let tot_collection;
                console.log(complete_payment_method)
                console.log(complete_payment_method.length)
                $.each(complete_payment_method,function(index,each_array){
                  console.log(collection_data);
                   tot_collection = (collection_data[each_array[0]['linked_account']]) ? collection_data[each_array[0]['linked_account']] : '0.00';
                   if(index.toLowerCase() == 'complementary')return true;
                   let pay_icon = (index.toLowerCase() == 'cash') ? 'cash.svg' : 'card.svg';
                   payment_types += `<div class="col-xs-12 col-sm-12 col-md-12 mb-10 each_payment_mode" data-mode="${index}" data-linked="${each_array[0]['linked_account']}">
                                        <div class="col_inner_wrapper" data-paying_area="${index}">
                                          <img src="images/${pay_icon}"> <h4>${index} <span class="payment_method_${each_array[0]['linked_account']}">${tot_collection}</span></h4>
                                        </div>
                                      </div>`;
                });
                console.log(payment_types)
                $('.payment_methods_list').html(payment_types);
                $('#hd_counter').text(delivered_bills+'/'+total_bills);
                removeAjaxLoad();
                // setTimeout(function(){$('.main_entry_fld').trigger('focus')},100);
              }
              else
              {
                loadErrorPopup('Software Error','Data not loaded, Contact Support team.','1')
              }
          }
          else
          {
            // $.alert(data.message)
            loadErrorPopup('Loading Error',data.message,'1')
          }
        },
        error:function(request, status, error)
        {
          removeAjaxLoad();
          // //console.log('kkkkkkkkkkkkk')
            // //console.log(request.responseText);
            //console.log(status);
              $('.file-upload-error').html(error).show();
            // $('.sData_container').addClass('has-error').after(`<p class="text-danger error-text file_error">${error}</p>`);
          $('body').removeClass('skeleton');
            return false;
        }
      });
}
function LoadPendingOrder(filter_search='')
{
  $.ajax({
    url      : base_url+"/pos_api/fetchPendingDeliveries",
    data     : {'order_id':0,'user_id': user_id,'branch_id':branch_id,'client_identifier':client_identifier, 'filter_content': filter_search},
    type     : "POST",
    dataType : "JSON",
    success: function (full_data) {
        let bill_data        = full_data[0];
        let user_status        = full_data[1];
        if (user_status == 0) {
          let message = 'Driver Not Found'
          settleErrorPopup(message)
        }else{
            $('.main_entry_fld').val('')
            $(".prev_bill_table tbody").html('');
             $(".new_bill_table tbody").html('');
            

            let drivername        = full_data[2];
            let driverId        = full_data[3];
            $('.delivery_username').val(drivername)
            $('.delivery_username').attr('data-user_id', driverId)


            bill_data = bill_data? bill_data : [];
            let prev_bill_html = ``;
            let new_bill_html = ``;
            let total_new_bill = 0;
            let total_prev_bill = 0;
            let total_advance = 0;
            let total_payment = 0;
            let outstanding_total = 0;
            let prev_count = 0
            let new_count = 0;
            let other_paid_total = 0;
            let driver_id = 0;

            let currency_short   = window.localStorage.getItem('currency_short');
            if (bill_data.length > 0) {

              let drivername = bill_data[0].drivername;
              driver_id = bill_data[0].user_id?bill_data[0].user_id:0;
              $('.delivery_username').val(drivername)

              $('.delivery_username').attr('data-user_id', bill_data[0].user_id)

              bill_data.forEach(function(bill, i) 
              {
                i++;
                let grand_total = bill.grand_total;
                let status = bill.status;
                let invoice_id = bill.invoice_id;
                let in_amount = bill.in_amount?bill.in_amount:0;
                let payment_received = bill.payment_received?bill.payment_received:0;

                if (status == 0 && invoice_id != 0) {
                  let name = bill.customer_name?bill.customer_name:'';
                  let address = bill.customer_address?bill.customer_address:'';
                  let mobile = bill.customer_mobile?bill.customer_mobile:'';
                  let trn = bill.customer_trn?bill.customer_trn:'';
                  let received_amount = bill.received_amount?bill.received_amount:0;
                  // console.log(name)
                  // console.log(mobile)
                  other_paid_total  = Number(other_paid_total) + Number(received_amount);

                  new_count = Number(new_count) + 1;
                  total_new_bill  = Number(total_new_bill) + Number(grand_total);

                  let job_type_flag = 'btn-success'; 
                  let job_type_char = 'N'; 
                  if(bill.job_type == '1'){
                    job_type_flag = 'btn-danger'; 
                    job_type_char = 'U'; 
                  } 

                  new_bill_html += `<div class="col-sm-12 each_del_item">
                                <div class="panel" data-order="${invoice_id}">
                                    <div class="panel-body p-t-10">
                                        <div class="media-main">
                                            <a class="pull-left" href="#">
                                                <div class="Profile_name bg_yellow">MW</div>
                                            </a>
                                            <div class="pull-right btn-group-sm">
                                                <a href="#" class="btn ${job_type_flag} tooltips" data-placement="top" data-toggle="tooltip" data-original-title="Edit">
                                                    <i class="fa">${job_type_char}</i>
                                                </a>
                                            </div>
                                            <div class="info">
                                                <h4>${name}</h4>
                                                <p class="text-muted">${mobile}</p>
                                                <ul class="order_details">
                                                  <li>Order #${bill.order_no}</li>
                                                  <li>${bill.tot_qty} Qty</li>
                                                  <li>${RoundNum(grand_total, 2)} ${currency_short}</li>
                                                </ul>
                                                <ul class="date">
                                                  <li>Date: <span>${bill.order_date}</span></li>
                                                  <li>Delivery: <span>${bill.delivery_date}</span></li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div class="clearfix"></div>
                                        <hr>
                                       
                                    </div>
                                </div>
                            </div>`;
                }
              })
            }else{
              new_bill_html = `<div class="col-sm-12">   
                                  No orders found.!
                              </div>`;
            }
            let total_bill = Number(total_prev_bill) + Number(total_new_bill)+ Number(total_advance);
            outstanding_total = Number(total_bill) - Number(total_payment) - Number(other_paid_total)

            $('.delivery_orders').html(new_bill_html)
            
        }
        removeAjaxLoad();
    },
    beforeSend: function (request) {
      loadAjax();
        $('.und_order_wrap').addClass('hidden');
        $('.spinner_wrap').removeClass('hidden');
    },
    complete: function (request) {
        $('.spinner_wrap').addClass('hidden');
       $('.und_order_wrap').removeClass('hidden');
    },
    error:function(request, status, error)
    {
        removeAjaxLoad();
        console.log(error);
        return false;
    }
  });
}
function LoadCounterData()
{  
  let shift_id     = window.localStorage.getItem('shift_id');
  let keep_driver_shift_separately = window.localStorage.getItem('keep_driver_shift_separately');
  let disable_shift_opening_closing_from_driver_app = window.localStorage.getItem('disable_shift_opening_closing_from_driver_app');
  let currency_short   = window.localStorage.getItem('currency_short');
  if(shift_id >= 0)
  {
     $.ajax({
        url      : base_url+"/pos_api/loadCounterData",
        data     : {'user_id': user_id,'branch_id':branch_id,'client_identifier':client_identifier, 'shift_id': shift_id},
        type     : "POST",
        dataType : "JSON",
        success: function (data) {
            let response = data.data;
            disable_shift_opening_closing_from_driver_app = response.disable_shift_opening_closing_from_driver_app;
            keep_driver_shift_separately = response.keep_driver_shift_separately;
            let html = '';
            removeAjaxLoad();
            console.warn(keep_driver_shift_separately,disable_shift_opening_closing_from_driver_app)
            if(response.shift_id > 0)
            {
              window.localStorage.setItem('shift_id',response.shift_id)
              html = `<ul class="date total_balence">
                         <li>Counter Opened On</li>
                         <li><span class="counter_opened_on">${response.counter_open_date} ${response.counter_open_time}</span></li>
                      </ul>
                      <ul class="date total_balence">
                         <li>Counter Opening Amount</li>
                         <li><span class="counter_open_amt">${response.opening_counter_amount} ${currency_short}</span></li>
                      </ul>
                      <ul class="date total_balence">
                         <li>Counter Collected Amount</li>
                         <li><span class="counter_collected_amt">${response.collected_counter_amount} ${currency_short}</span></li>
                      </ul>`;
              if(disable_shift_opening_closing_from_driver_app == 1)
              {
                $('.close_counter').hide();
              }
              $('footer.footer').show();
            }
            else{
              $('footer.footer').hide();
              
              if(keep_driver_shift_separately == 1)
              {
                html = `<ul class="date total_balence">
                              <li class="center_align no_transform">Currently there is no counter shift opened for this user. Please open a counter to process delivery from the Application.</li>
                            </ul>
                            <p class="open_counter_p"><a href="javascript:" class="open_counter">Open Counter</a></p>`
              }
              if(disable_shift_opening_closing_from_driver_app == 1)
              {
                html = `<ul class="date total_balence">
                              <li class="center_align no_transform">Currently there is no shift opened for this user. Please contact the Administrator and get the shift opened from backend.</li>
                            </u>`;
              }
            }
            $('.counter_shift_details .info').html(html);
        },
        beforeSend: function (request) {
          loadAjax();
          $('footer.footer').hide();
        },
        complete: function (request) {
        },
        error:function(request, status, error)
        {
            removeAjaxLoad();
            console.log(error);
            return false;
        }
      });
  }
}
$('body').on('click','.filter_action',function(){
  let filter_search = $('.filter_content').val();
  console.log({filter_search})
  LoadPendingOrder(filter_search)
})
$('body').on('click','.each_del_item .panel',function(){
  let order_id = $(this).data('order');
  loadAjax();
    $.ajax({
        url: base_url+'/pos_api/findDeliveryOrderDetails',
        method: 'POST',
        data: {'client_identifier': client_identifier,'branch_id':branch_id,'s_order_id':order_id,'order_id':0},
        dataType : "JSON",
        success: function(data) 
        {
          removeAjaxLoad();
          // console.log(data)
          if(data == '0')
          {
            let title = 'Alert.. !';
            let content = 'Error in Loading, Please contact Software Support.';
            loadErrorPopup(title,content,'1')
          }
          else
          {
            let currency_short   = window.localStorage.getItem('currency_short');
            let no_of_decimals   = window.localStorage.getItem('no_of_decimals');
            let order_details = data[0];
            let complete_payment_method = data[1];
            let credit_sale = data[2];
            $('#order_id_share').val(order_id);
            $('#order_link_share').val(order_details[0].sharelink);
            $('.del_ord_no').text("Order #"+order_details[0].order_no);
            $('.del_cust_name').text(order_details[0].customer_name);
            $('.del_cust_address').text(order_details[0].address2);
            $('.del_cust_mobile').text(order_details[0].customer_mobile);
            $('.del_order_date').text(order_details[0].order_date);
            $('.del_delivery_date').text(order_details[0].delivery_date);
            $('.tot_outstanding').text(order_details[0].cust_total_credit.toFixed(no_of_decimals) + ' '+currency_short);
            $('.tot_outstanding').data('total_outstanding',order_details[0].cust_total_credit.toFixed(no_of_decimals));
            $('.bill_tot_amount').text(Number(order_details[0].grand_total).toFixed(no_of_decimals) + ' '+currency_short);
            $('.bill_balance_amount').text(Number(order_details[0].balance).toFixed(no_of_decimals) + ' '+currency_short);
            $('.bill_balance_amount').data('balance_amt',Number(order_details[0].balance).toFixed(no_of_decimals));
            $('#customer_id').val(order_details[0].customer_id);
            $('#order_id').val(order_id);
            $('#credit_sale').val(credit_sale);
            $('#shipping_id').data('latitude',order_details[0].latitude);
            $('#shipping_id').data('longitude',order_details[0].longitude);
            $('#shipping_id').val(order_details[0].shipping_id);

            $('#shipping_id').data('loc_building',order_details[0].map_loc_building);  
            $('#shipping_id').data('loc_apartment',order_details[0].map_loc_apartment);
            $('#shipping_id').data('loc_name',order_details[0].map_loc_name);  
            $('#shipping_id').data('loc_other',order_details[0].shipping_other_info);
            // $('.tot_outstanding').text(Number(order_details[0].balance).toFixed(no_of_decimals) + ' '+currency_short);
            let product_data = ``;
            $.each(order_details,function(index,each_data){
              product_data += `<tr>
                                 <th scope="row">${++index}</th>
                                 <td>${each_data.primary_sale_prdt_name}</td>
                                 <td class="text_right">${each_data.sale_qty}</td>
                                 <td class="text_right">${Number(each_data.sale_sub_total).toFixed(no_of_decimals)}</td>
                              </tr>`;
            })
            product_data += `<tr class="total_blc">
                                 <td colspan="3" class="text_right font-weight-bold">VAT</td>
                                 <td colspan="1" class="font-weight-bold text_right">${Number(order_details[0].tax_amount).toFixed(no_of_decimals)}</td>
                              </tr>
                              <tr class="total_blc">
                                 <td colspan="3" class="text_right font-weight-bold no_border">Total Amount</td>
                                 <td colspan="1" class="font-weight-bold no_border text_right">${Number(order_details[0].total_amount).toFixed(no_of_decimals)}</td>
                              </tr>
                              <tr class="total_blc">
                                 <td colspan="3" class="text_right font-weight-bold no_border">Grand Total</td>
                                 <td colspan="1" class="font-weight-bold text_right no_border">${Number(order_details[0].grand_total).toFixed(no_of_decimals)}</td>
                              </tr>
                              <tr class="total_blc">
                                 <td colspan="2" class="font-weight-bold no_border">Paid: ${Number(order_details[0].received_amount).toFixed(no_of_decimals)}</td>
                                 <td colspan="1" class="text_right font-weight-bold no_border">Balance</td>
                                 <td colspan="1" class="font-weight-bold no_border text_right">${Number(order_details[0].balance).toFixed(no_of_decimals)}</td>
                              </tr>`;
            $('.del_order_details tbody').html(product_data);
            let payment_types = ``;
            $.each(complete_payment_method,function(index,each_array){
              // console.log(each_array);
               if(index.toLowerCase() == 'complementary')return true;
               payment_types += `<div class="form-group each_payment_method" data-mode="${index}" data-linked="${each_array[0]['linked_account']}">
                                    <label class="payment-type" for="formGroupExampleInput">${index}</label>
                                    <input type="text" class="form-control received_amt numeric_only" id="payment_method_${each_array[0]['linked_account']}" placeholder="">
                                    <span class="pay_full">Pay in Full</span>
                                  </div>`;
            });
            // console.log(payment_types)
            $('.payment_methods').html(payment_types);
            $(".home_delivery_order_popup").modal({backdrop: 'static', keyboard: false});
          }
        },
        error:function(request, status, error)
        {
          removeAjaxLoad();
          $('body').removeClass('skeleton');
          return false;
        }
      });
})
$('body').on('click','.pay_full',function(){
  let balance = $('.bill_balance_amount').data('balance_amt');
  if(balance <= 0) return false;
  console.log('balance',balance)
  $('.received_amt').val('');
  $(this).closest('.each_payment_method').find('.received_amt').val(balance);
})
$('body').on('click','.delivery-btn',function(){
  checkImageCount();
  let addr_lebel = 'Add Location';
  if($('#shipping_id').val() > 0)
  {
    addr_lebel = 'Update Location';
  }
  $('label[for="inlineCheckbox1"]').text(addr_lebel);
  $("#bottom_modal_one").modal({backdrop: 'static', keyboard: false});
})
$(document).ready(function() {
    $('.upload_img').click(function(){
        $(".file-input").trigger('click');
        return false;
    });
    var formData = '';
    $('.reset').click(function(){
        $.confirm({
            title: false,
            boxWidth: '80%',
            useBootstrap: false,
            type: 'blue',
            content: '' +
              '<div class="form-group invoice-found">' +
              '<h2>Confirm !</h2>' +
              '<p>Are you sure to remove all the uploaded images?</p>'+
              '</div>',
            type: 'blue',
            buttons: {
                cancel: {
                    action: function (cancel) {
                      //window.top.close();
                    },
                    text: 'No, Cancel'
                      //close
                  },
                  ok:{
                    text: 'Ok',
                    btnClass: 'btn-blue',
                      action: function () {
                        let upload_api_link = api_url + '/pos_api/DeleteImg';
                        let img_urls = [];
                        let file_ids = [];
                        $(".img").each(function(){
                            img_urls.push($(this).data('img_file_name'));
                            file_ids.push($(this).data('file_id'));
                        });
                        
                        // console.log(img_urls);
                        // return false;
                        $.ajax({
                            url: upload_api_link,
                            type:'POST',
                            data:{'img_urls':img_urls,'file_ids':file_ids,'client_identifier':client_identifier},
                            success:function(data){
                                $(".image_list_ul").empty();
                                formData = new FormData();
                                checkImageCount()
                            }

                        })
                      }
                  }
            },
            onOpenBefore: function () {
                // before the modal is displayed.
                $('.jconfirm').addClass('specClass')
                $('.jconfirm-buttons').addClass('full-width')
            },
            onContentReady: function () {
                  let jc = this;
                  $(".btn.btn-blue").focus();
                  jc.$content.on('keydown',function(e){
                    if(e.which == 13  || e.keyCode == 13)
                    {
                      jc.$$ok.trigger('click');
                    }
                  });
            }
        });
    });
    let image_upload = function()
    {
        loadAjax();
        let upload_api_link = api_url + '/pos_api/UploadImg'
        let api_url_arr = api_url.split('/');
        api_url_arr.pop();
        let img_url = api_url_arr.join('/');
        $.ajax({
           url: upload_api_link,
           data: formData,
           contentType: false,
           processData: false,
           type: 'POST',
           dataType:'JSON',
           success: function(data)
           {
                if(data['img_sts'] == 0 || data['img_sts'] == '0')
                {
                    $(".image_list_ul").append(`<li>
                            <div class="imagelist_img">
                            <img class="img">
                            </div>
                        </li>`);
                    console.log(data);
                    console.log(api_url);
                    let img_show_url = api_url.replace(client_identifier.toLowerCase(),'');
                    $('.img').eq($(".imagelist_img").length - 1).attr('src', img_show_url+data['file_name_with_path']);
                    $('.img').eq($(".imagelist_img").length - 1).data('img_file_name',data['file_name']);
                    $('.img').eq($(".imagelist_img").length - 1).data('file_id',data['file_id']);
                    console.log($('.img').eq($(".imagelist_img").length - 1).data('img_file_name'));    
                    checkImageCount()
                }
                else
                {
                    $.alert('<b>Photo/Image Only Acceptable !</b><br>Please take photo with Camera Or Choose image from gallary');
                }
                removeAjaxLoad();
            // console.log(data);
           }
        });   
    }
    $("body").on('change','.file-input',function(){
        formData = new FormData();
        let imei_id = window.localStorage.getItem('imei_id');
        let that = this;
        let len  = $(".imagelist_img").length;
        console.log(len);
        formData.append('images',$('.file-input')[0].files[0]);
        formData.append('client_identifier',client_identifier);
        formData.append('imei_id',imei_id);
        let url   = this.value;
        let ext   = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
        console.log(ext);
        var reader = new FileReader();
        reader.onload = function (e) {
            image_upload();
        }
        reader.readAsDataURL(this.files[0]);
    });  
    $("body").on('keypress','.numeric_only',function(evt){
      let charCode = (evt.which) ? evt.which : evt.keyCode;
      if(charCode == 46)
      {
        let existing_value = $(this).val();
        console.log(existing_value.includes('.'));
        if(!existing_value.includes('.'))
          return (charCode > 31 && (charCode < 46 || charCode > 57)) ? false : true
        else
          return false;
      }
      else
       return (charCode > 31 && (charCode == 47 || charCode < 46 || charCode > 57)) ? false : true
    }); 
})
$(document).on('click', '.save_address', function () {
    $(".location_txt,.apartment_txt,.name_txt").removeClass('invalid');
    let location_txt = $(".location_txt").val();
    let apartment_txt = $(".apartment_txt").val();
    let name_txt = $(".name_txt").val();
    let addr_spec_txt = $(".addr_spec_txt").val();
    // if (location_txt == "") $(".location_txt").addClass('invalid');
    // if (apartment_txt == "") $(".apartment_txt").addClass('invalid');
    // if (name_txt == "") $(".name_txt").addClass('invalid');
    let pm_id = '';
    // if (!$(".location_txt").hasClass('invalid') && !$(".apartment_txt").hasClass('invalid') && !$(".name_txt").hasClass('invalid')) {
        $(".lds-ripple").removeClass('invisibl');
        $('#shipping_id').data('loc_building',location_txt);  
        $('#shipping_id').data('loc_apartment',apartment_txt);
        $('#shipping_id').data('loc_name',name_txt);  
        $('#shipping_id').data('loc_other',addr_spec_txt);
        $("#address").modal('hide');
        processDelivery();
    // }
}); 
function checkImageCount() {
  if($('.image_list_ul').find('li').length > 0)
  {
    $('.delete_all_uploaded').removeClass('hidden')
  }
  else
  {
    $('.delete_all_uploaded').addClass('hidden')
  }
}
$('body').on('click','.deliver-btn',function(){
  if($(this).hasClass('processing_action'))
    return false;
  let lat = $('#shipping_id').data('latitude');  
  let lng = $('#shipping_id').data('longitude');
  let update_location = $("#inlineCheckbox1").is(":checked") ? '1' : '0';

  if(lat!='' && lng!='' && update_location == '1')
    setCurrentPosition(lat, lng)
  else
    GetDeviceLocation()

  let balance = $('.bill_balance_amount').data('balance_amt');
  let shift_id    = window.localStorage.getItem('shift_id');
  let shift_error = shift_id > 0 ? 0 : 1;
  if(shift_error == 1){
    $.alert('<b>Warning !</b><br>You cannot process this action, Please contact customer support.');
    return false;
  }
  
  let received_amount = get_current_payment();

  let credit_sale = $('#credit_sale').val();
  if(received_amount > balance){
    $.alert('<b>Warning !</b><br>You cannot pay more than the balance amount.');
    return false;
  }
  if(credit_sale!='1' && received_amount != balance)
  {
    $.alert('<b>Warning !</b><br>Credit sale disabled.');
    return false;
  }

  if(update_location == '1'){
    $("#add_address").modal({
        backdrop: 'static',
        keyboard: false
    });
  }
  else
    processDelivery();
})
let processDelivery = function(){
  let $this = $('.deliver-btn');
  let customer_id = $('#customer_id').val();
  let order_id = $('#order_id').val();
  let file_ids = [];
  $(".img").each(function(){
      file_ids.push($(this).data('file_id'));
  });
  let balance = $('.bill_balance_amount').data('balance_amt');
  let shift_id    = window.localStorage.getItem('shift_id');
  let shift_error = shift_id > 0 ? 0 : 1;
  if(shift_error == 1){
    $.alert('<b>Warning !</b><br>You cannot process this action, Please contact customer support.');
    return false;
  }
  let order_delivery_details     = {};
  let update_location = $("#inlineCheckbox1").is(":checked") ? '1' : '0';
  order_delivery_details['lat']       =  $('#shipping_id').data('latitude');
  order_delivery_details['lng']       =  $('#shipping_id').data('longitude');
  order_delivery_details['balance']       =  balance;
  order_delivery_details['customer_id']   =  customer_id;
  order_delivery_details['order_id']      =  order_id;
  order_delivery_details['order_images']  =  file_ids;
  order_delivery_details['shift_id']      =  shift_id;
  order_delivery_details['update_location'] =  update_location;
  order_delivery_details['received_amount'] = get_current_payment();
  order_delivery_details['received_amount_details'] = get_received_amount_details();

  let location_details = {};
  location_details['loc_building']  = $('#shipping_id').data('loc_building');  
  location_details['loc_apartment'] = $('#shipping_id').data('loc_apartment');
  location_details['loc_name']  = $('#shipping_id').data('loc_name');  
  location_details['loc_other'] = $('#shipping_id').data('loc_other');
  order_delivery_details['location_details'] =  location_details; 
  order_delivery_details['shipping_id'] =  $('#shipping_id').val();


  let credit_sale = $('#credit_sale').val();
  if(order_delivery_details['received_amount'] > balance){
    $.alert('<b>Warning !</b><br>You cannot pay more than the balance amount.');
    return false;
  }
  if(credit_sale!='1' && order_delivery_details['received_amount'] != balance)
  {
    $.alert('<b>Warning !</b><br>Credit sale disabled.');
    return false;
  }
  $.confirm({
    title: false,
    boxWidth: '90%',
    useBootstrap: false,
    draggable: true,
    type: 'blue',
      content: '' +
        '<div class="form-group invoice-found">' +
        '<h2>Confirmation !!!</h2>' +
        '<p>Make sure the amount collected and the payment method provided are correct before processing the request.</p><br><p>Are you sure to continue !</p>'+
        '</div>',
      buttons: {
          cancel: {
              action: function (cancel) {
                
              },
              text: "No, Cancel"
                //close
            },
            ok:{
              text: "Yes, Continue",
              btnClass: 'btn-blue',
                action: function () {
                  $this.addClass('processing_action')
                  loadAjax()
                  $.ajax({
                      url      : base_url+"/pos_api/deliveryProcess",
                      data     : {'order_delivery_details':order_delivery_details,'order_id':order_id, 'client_identifier': client_identifier, 'user_id': user_id, 'branch_id' : branch_id,'currency_id':currency_id},
                      type     : "POST",
                      dataType : "JSON",
                      success: function (data) {
                          removeAjaxLoad();
                          if(data.response_code==200)
                          {
                            $.confirm({
                                title: 'Saving Successful',
                                content: 'Your delivery saved successfully.',
                                boxWidth: '50%',
                                useBootstrap: false,
                                icon: 'fas fa-exclamation-triangle',
                                backgroundDismissAnimation: 'glow',
                                type: 'green',
                                autoClose: 'redirectUser|5000',
                                buttons: {
                                    redirectUser: {
                                        text: 'Next delivery - ',
                                        action: function () {
                                            window.location.replace(`landing.html`);
                                        }
                                    }
                                }
                            });
                          }
                          else
                          {
                            $.alert('<b>Error !</b><br>'+data.message);
                          }
                          // window.location = "delivery/landing.html";
                          $this.removeClass('processing_action')
                      },
                    error:function(data){
                      $this.removeClass('processing_action')
                      // showToaster(501, 'Shif opening error !');
                      return false;
                    }
                  });
                }
            }
      },
      onContentReady: function () {
          // bind to events
          $('.jconfirm-buttons').addClass('full-width')
          var jc = this;
          this.$content.parents('.jconfirm').addClass('jconfirm_custom');
          this.$content.find('.job_search_txt').on('keyup', function (e) {
            let val = $(this).val();
            
            if(e.which == 13  || e.keyCode == 13)
            {
              jc.$$ok.trigger('click');
            }
          }); 
      }
  });
}
let get_received_amount_details = function()
{
  let payment_recieve_type;
  let payment_received;
  let received_amount_details = {};
  let id = "";
  let card_identifiers  = {};
  let linked_account_id = "";
  $(".each_payment_method").each(function(){
    payment_received = Number($(this).find('input.received_amt').val());
    if(payment_received > 0)
    {
      payment_recieve_type = $(this).find('label.payment-type').text();
      payment_recieve_type = payment_recieve_type.replace(/\s+/g, '-');
      linked_account_id    = $(this).data('linked');
      received_amount_details[payment_recieve_type] = {};
      received_amount_details[payment_recieve_type]['amount'] = payment_received;
      received_amount_details[payment_recieve_type]['date_time'] = getCurrentDateAndTime();
      received_amount_details[payment_recieve_type]['linked_account_id'] = linked_account_id;
      if(payment_recieve_type.toLowerCase() == "cash")
      {
        received_amount_details[payment_recieve_type]['tender_cash']  = payment_received;
        received_amount_details[payment_recieve_type]['change_given'] = 0;
      }
      else
      {
        received_amount_details[payment_recieve_type]['card_details'] = [];
        card_identifiers = {};
        card_identifiers['card_name']   = "";
        card_identifiers['card_no']     = "";
        card_identifiers['card_amount'] = payment_received;
        card_identifiers['date']        = getCurrentDateAndTime();
        received_amount_details[payment_recieve_type]['card_details'].push(card_identifiers);
      }
    }
  });
  return received_amount_details;
}
function getCurrentDateAndTime()
{
  let  current_time = new Date().toLocaleString("en-US", {timeZone: time_zone});
  current_time = new Date(current_time);
  console.log(current_time.getHours()+':'+current_time.getMinutes())
  return current_time.toLocaleString();
  //console.log('Asia time: '+current_time.toLocaleString())
}
function get_current_payment()
{
  let current_payment = 0;
  $(".received_amt").each(function(){
    current_payment += Number($(this).val()?$(this).val():0);
  });
  return current_payment;
}
$('body').on('click','.open_counter',function(){
  loadAjax();
  $.ajax({
      url: base_url+'/pos_api/getCurrencies',
      method: 'POST',
      data: {'client_identifier': client_identifier,'branch_id':branch_id},
      dataType : "JSON",
      success: function(data)
      {
          let response = data.data;
          console.log(response)
          if(Object.keys(response).length > 0)
          {
            let currencies = response.currencies;
            let currenciesHtml = '<div class="row"><div class="col-md-12"><h1 class="head_title_h1">Open Counter</h1></div></div>';
            currenciesHtml +='<div class="row"><div class="denominatio_content_counter theam1_border">\
                              <div class="row">';
            currencies.map(function(currency, index)
            {               
              currenciesHtml +='<div class="new_row"><div class="col-md-9">\
                                      <div class="payment_data_wrp theam1_border">\
                                          <h3 class="currency">'+currency.currency+'</h3><span>X</span>\
                                          <div class="input-group number-spinner">\
                                              <button class="common_decr number_btn_left theam1_background" data-dir="dwn" style="font-weight:900">-\
                                              </button>\
                                              <input type="text" class="counter_open_input opening_counter_input white_input_ripple numeric_only theam1_border" value="0">\
                                              <button class="common_incr number_btn_right theam1_background" data-dir="up" style="font-weight:900">+\
                                              </button>\
                                          </div>\
                                      </div>\
                                  </div>\
                                  <div class="col-md-3" style="padding-left:0">\
                                      <div class="Payment_count theam1_background">\
                                          <h3 class="currency_total">0</h3>\
                                      </div>\
                                  </div></div>';
             })
            currenciesHtml +='</div></div>\
              <div class="denominatio_content_counter theam1_border" style="padding: 10px 0 0;    margin: 15px 5px;">\
                  <div class="col-sm-12 col-lg-12 col-md-12">\
                     <h5>Counter Opening Amount</h5>\
                     <input type="number" readonly class="form-control setting_var counter_opening_amount" data-name="counter_opening_amount" value="0">\
                  </div>\
                  <div class="col-md-12 settings_btns" style="display:block">\
                      <button type="button" class="btn btn-dark clear_opening_balance" >Clear</button>\
                      <button type="button" name="save_opening_balance" class="pull_right btn btn-info save_opening_balance">Open Counter</button>\
                  </div>\
              </div>\
              </div>';
              //<button type="button" class="btn btn-dark" data-dismiss="modal">'+langTxt.CLOSE_TXT+'</button>\
              $('.modal_counter_open_body').html(currenciesHtml);
              $(".modal_counter_open").modal({backdrop: 'static', keyboard: false});
              $('.clear_opening_balance').trigger('click');
              setTimeout(function(){ $(".denominatio_content_counter").find('.counter_open_input').eq(0).focus();},1000)
          }
          else
          {
              $.alert('<b>Something went wrong !</b><br>Please try again later.');
          }
          removeAjaxLoad();
      // console.log(data);
      },
      error:function(request, status, error)
      {
        removeAjaxLoad();
        return false;
      }
  }); 
})
$("body").on("click",".common_decr",function(){
    let input  = $(this).siblings('.counter_input').val();
    let input1 = $(this).siblings('.counter_open_input').val();
    if(Number(input)>0)--input;
    if(Number(input1)>0)--input1;
    $(this).siblings('.counter_input').val(input);
    $(this).siblings('.counter_open_input').val(input1);
    $(this).siblings('.counter_input').trigger('change');
    $(this).siblings('.counter_open_input').trigger('change');
});
$("body").on("click",".common_incr",function(){
    let input = $(this).siblings('.counter_input').val();
    let input1 = $(this).siblings('.counter_open_input').val();
    ++input;
    ++input1;
    $(this).siblings('.counter_input').val(input);
    $(this).siblings('.counter_input').trigger('change');
    $(this).siblings('.counter_open_input').val(input1);
    $(this).siblings('.counter_open_input').trigger('change');
});
$("body").on("click",".clear_denomination",function(){
    if(!$(".choose_demo_btn").hasClass('low_opacity'))
    {
        $(".choose_demo_btn").addClass('skeleton');//addClass('low_opacity');
        $('.choose_demo_btn').data('denom_tot','0');
        let tip = document.querySelector("#denocontent");
        tippy(tip);
        tip._tippy.setContent(regenerateDenomination());
        setTimeout(function(){
            $(".denocontent").find('.fa-check').remove();
            $(".denocontent").addClass('low_opacity');
            $(".denocontent").removeClass('skeleton');
         },500);
    }
});
$("body").on("change",".counter_input",function(e){
    let input = "";
    let currency = "";
    let currency_total = "";
    let index    = "";
    let currency_grand_total = 0;
    input = $(this).val();
    console.log(input);
    input = Number(input);
    currency = $(this).parents('.payment_data_wrp').find('.currency').text();
    currency_total = Number(currency) * input; 
    console.log(currency_total);
    index = $(".tippy-content").find(".counter_input").index($(this));
    $(".tippy-content").find(".currency_total").eq(index).text(currency_total);
    $(".currency_total").each(function(){
        currency_grand_total += Number($(this).text());
    });
    $(".tippy-content").find(".currency_grand_total").text(currency_grand_total);

});
$("body").on("change",".opening_counter_input",function(e){
    let input = "";
    let currency = "";
    let currency_total = "";
    let index    = "";
    let currency_grand_total = 0;
    input = $(this).val();
    console.log(input);
    input = Number(input);
    currency = $(this).parents('.payment_data_wrp').find('.currency').text();
    currency_total = Number(currency) * input; 
    console.log(currency_total);
    index = $(".denominatio_content_counter").find(".counter_open_input").index($(this));
    $(".denominatio_content_counter").find(".currency_total").eq(index).text(currency_total);
    $(".denominatio_content_counter .currency_total").each(function(){
        currency_grand_total += Number($(this).text());
    });
    $(".denominatio_content_counter").find(".counter_opening_amount").val(currency_grand_total);

});
$("body").on("keyup",".counter_input",function(e){
    $(this).trigger('change');
});
$("body").on("keyup",".opening_counter_input",function(e){
    $(this).trigger('change');
});
$("body").on("keydown",".counter_input",function(e){
    let index = "";
    let current_index = "";
    if(e.keyCode == 107) //incr
    {
        $(this).siblings('.common_incr').trigger('click');
        return false;
    }
    else if(e.keyCode == 109) //decr
    {
        $(this).siblings('.common_decr').trigger('click');  
        return false;
    }
    else if(e.keyCode == 13)
    {
        current_index = $(".tippy-content .counter_input").index($(this));
        if($(".tippy-content .counter_input").eq(current_index + 1).length == 0)
        {
            $(".denominatio_ok_btn").trigger('click');
        }
        else
            $(".tippy-content .counter_input").eq(current_index + 1).select();
    }
    // $(this).trigger('change');
});
$("body").on("keydown",".opening_counter_input",function(e){
    let index = "";
    let current_index = "";
    if(e.keyCode == 107) //incr
    {
        $(this).siblings('.common_incr').trigger('click');
        return false;
    }
    else if(e.keyCode == 109) //decr
    {
        $(this).siblings('.common_decr').trigger('click');  
        return false;
    }
    else if(e.keyCode == 38)
    {

        current_index = $(".denominatio_content_counter .counter_open_input").index($(this));
        if($(".denominatio_content_counter .counter_open_input").eq(current_index - 1).length > 0)
            $(".denominatio_content_counter .counter_open_input").eq(current_index - 1).select();
        else
            return false;
    }
    else if(e.keyCode == 40)
    {
        // current_index = $(".denominatio_content_counter .counter_open_input").index($(this));
        // if($(".denominatio_content_counter .counter_open_input").eq(current_index + 1).length > 0)
        //  $(".denominatio_content_counter .counter_open_input").eq(current_index + 1).select();
        // console.log($(this).parents('.new_row').next('.new_row').find('.counter_open_input').length)
        if($(this).parents('.new_row').next('.new_row').find('.counter_open_input').length > 0){
            $(this).parents('.new_row').next('.new_row').find('.counter_open_input').select();
            // console.log('down key pressewde')
        }
        else
            $(".btn-info").trigger('focus');
    }
    else if(e.keyCode == 13)
    {
        current_index = $(".denominatio_content_counter .counter_open_input").index($(this));
        if($(".denominatio_content_counter .counter_open_input").eq(current_index + 1).length == 0)
        {
            $(".btn-info").trigger('focus');
        }
        else
            $(".denominatio_content_counter .counter_open_input").eq(current_index + 1).select();
    }
    // $(this).trigger('change');
});

$("body").on("click",".clear_opening_balance",function(){
    $('.counter_open_input').val('0');
    $('.currency_total').text('0');
    $('.counter_opening_amount,.counter_expense_amount').val('0');      
    setTimeout(function(){ $(".denominatio_content_counter").find('.counter_open_input').eq(0).focus();},1000)
})

$("body").on("click",".save_opening_balance",function(){
    $.confirm({
                title: false,
                boxWidth: '90%',
                useBootstrap: false,
                draggable: true,
                type: 'blue',
                content: '' +
                    '<div class="form-group invoice-found">' +
                    '<h2>Confirmation !!</h2>' +
                    '<p>Are you sure to open counter with the entered amount? You cannot change this later !</p>'+
                    '</div>',
                buttons: {
                      cancel: {
                            action: function (cancel) {
                                
                            },
                            text: 'No, Cancel'
                            //close
                        },
                        ok:{
                            text: 'Open Counter Shift',
                            btnClass: 'btn-blue',
                            action: function () {
                                let open_counter_denom = {};
                                let denom_key = '';
                                let denom_val = '';
                                let counter_opening_amount = $('.counter_opening_amount').val()?$('.counter_opening_amount').val():'0';
                                $(".denominatio_content_counter .new_row").each(function(){
                                    denom_key = $(this).find('.currency').text();
                                    denom_val = $(this).find('.counter_open_input').val()?$(this).find('.counter_open_input').val():'0';
                                    open_counter_denom[denom_key] = denom_val;
                                });
                                console.log(open_counter_denom);
                                $.ajax({
                                    url      : base_url+"/pos_api/opencounterAction",
                                    data     : {'counter_opening_amount':counter_opening_amount,'open_counter_denom':open_counter_denom, 'client_identifier': client_identifier, 'user_id': user_id, 'branch_id' : branch_id},
                                    type     : "POST",
                                    dataType : "JSON",
                                    success: function (data) {
                                        $('#modal_counter_open').modal('hide')
                                        location.reload();
                                    },
                                  error:function(data){
                                    showToaster(501, 'Shif opening error !');
                                    return false;
                                  }
                                }); 
                            }
                        }
                },
                onContentReady: function () {
                    // bind to events
                    $('.jconfirm-buttons').addClass('full-width')
                    var jc = this;
                    this.$content.parents('.jconfirm').addClass('jconfirm_custom');
                    this.$content.find('.job_search_txt').on('keyup', function (e) {
                        let val = $(this).val();
                        
                        if(e.which == 13  || e.keyCode == 13)
                        {
                            jc.$$ok.trigger('click');
                        }
                    }); 
                }
            });
})
$('body').on('click','.close_counter',function(){
  loadAjax();
  let shift_id     = window.localStorage.getItem('shift_id');
  $.ajax({
      url: base_url+'/pos_api/getCurrencies',
      method: 'POST',
      data: {'client_identifier': client_identifier,'branch_id':branch_id},
      dataType : "JSON",
      success: function(data)
      {
          let response = data.data;
          console.log(response)
          if(Object.keys(response).length > 0)
          {
            let currencies = response.currencies;
            let pos_date = response.pos_date;
            let currenciesHtml = '<div class="row"><div class="col-md-12"><h1 class="head_title_h1">Counter Closing</h1></div></div>';
            currenciesHtml +='<div class="row"><div class="denominatio_content_counter theam1_border">\
                              <div class="row">';
            currencies.map(function(currency, index)
            {               
              currenciesHtml +='<div class="new_row"><div class="col-md-9">\
                                      <div class="payment_data_wrp theam1_border">\
                                          <h3 class="currency">'+currency.currency+'</h3><span>X</span>\
                                          <div class="input-group number-spinner">\
                                              <button class="common_decr number_btn_left theam1_background" data-dir="dwn" style="font-weight:900">-\
                                              </button>\
                                              <input type="text" class="counter_open_input opening_counter_input white_input_ripple numeric_only theam1_border" value="0">\
                                              <button class="common_incr number_btn_right theam1_background" data-dir="up" style="font-weight:900">+\
                                              </button>\
                                          </div>\
                                      </div>\
                                  </div>\
                                  <div class="col-md-3" style="padding-left:0">\
                                      <div class="Payment_count theam1_background">\
                                          <h3 class="currency_total">0</h3>\
                                      </div>\
                                  </div></div>';
             })
            currenciesHtml +='</div></div>\
              <div class="denominatio_content_counter theam1_border" style="padding: 10px 0;">\
                <div class="col-sm-12 col-lg-12 col-md-12">\
                       <h5>Counter Expense Amount</h5>\
                       <input type="text" class="form-control setting_var counter_expense_amount numeric_only" data-name="counter_expense_amount" value="0">\
                </div>\
                <div class="col-sm-12 col-lg-12 col-md-12">\
                       <h5>Counter Collected Amount</h5>\
                       <input type="number" readonly class="form-control setting_var counter_opening_amount" data-name="counter_opening_amount" value="0">\
                </div>\
                <div class="col-sm-12 col-lg-12 col-md-12 close_date_div">\
                       <h5>Closing Date</h5>\
                       <input type="text" value="'+pos_date+'" class="form-control setting_var counter_closing_date" readonly>\
                       <p>Confirm the date before you are closing the counter If the date is wrong, please logout and select the date you want to close and login again</p>\
                </div>\
                <div class="col-md-12 settings_btns" style="display:block">\
                      <input type="hidden" class="current_shift_id" value="'+shift_id+'" />\
                      <button type="button" class="btn btn-dark clear_opening_balance" >Clear</button>\
                  <button type="button" name="save_closing_balance" class="pull_right btn btn-info save_closing_balance">Close Counter</button>\
                </div>\
              </div>\
              </div>';
              //<button type="button" class="btn btn-dark" data-dismiss="modal">'+langTxt.CLOSE_TXT+'</button>\
              $('.modal_counter_close_body').html(currenciesHtml);
              $(".modal_counter_close").modal({backdrop: 'static', keyboard: false});
              $('.clear_opening_balance').trigger('click');
              setTimeout(function(){ $(".denominatio_content_counter").find('.counter_open_input').eq(0).focus();},1000)
          }
          else
          {
              $.alert('<b>Something went wrong !</b><br>Please try again later.');
          }
          removeAjaxLoad();
      // console.log(data);
      },
      error:function(request, status, error)
      {
        removeAjaxLoad();
        return false;
      }
  }); 
})
$("body").on("click",".save_closing_balance",function(){
    $.confirm({
        title: false,
        boxWidth: '90%',
        useBootstrap: false,
        draggable: true,
        type: 'blue',
          content: '' +
            '<div class="form-group invoice-found">' +
            '<h2>Confirmation !!!</h2>' +
            '<p>Make sure the collected amount and the expense amount is correct before closing the counter. You cant change this later !</p>'+
            '</div>',
          buttons: {
              cancel: {
                  action: function (cancel) {
                    
                  },
                  text: "No, Cancel"
                    //close
                },
                ok:{
                  text: "Yes, Close Counter",
                  btnClass: 'btn-blue',
                    action: function () {
                            loadAjax();
                            let close_counter_denom = {};
                            let denom_key = '';
                            let denom_val = '';
                            let shift_id_update      = $('.current_shift_id').val();
                            let counter_closing_amount = $('.counter_opening_amount').val()?$('.counter_opening_amount').val():'0';
                            let counter_expense_amount = $('.counter_expense_amount').val()?$('.counter_expense_amount').val():'0';
                            let counter_closing_date = $('.counter_closing_date').val()?$('.counter_closing_date').val():'';
                            authCounterCloseWithHold = $('.save_closing_balance').data('authCounterCloseWithHold');
                            $(".denominatio_content_counter .new_row").each(function(){
                              denom_key = $(this).find('.currency').text();
                              denom_val = $(this).find('.counter_open_input').val()?$(this).find('.counter_open_input').val():'0';
                        close_counter_denom[denom_key.replace('.','-')] = denom_val;
                      });
                      console.log(close_counter_denom);
                      $.ajax({
                        url      : base_url+"/pos_api/closecounterAction",
                        data     : {'shift_id_update':shift_id_update,'counter_closing_amount':counter_closing_amount,
                                  'close_counter_denom':close_counter_denom,'counter_expense_amount':counter_expense_amount,
                                  'user_id':user_id, 'client_identifier': client_identifier,
                                   'counter_closing_date':counter_closing_date,
                                    'branch_id':branch_id, 'holded_items_enable': 0,
                                    'holded_items_with_delivery_enable': 0,
                                    'auth_status' : 0
                                  },
                        type     : "POST",
                        dataType : "JSON",
                        success: function (data) {
                          let status = data.status?data.status:'';
                          window.localStorage.setItem('last_shift_id',shift_id_update)
                          if (status == '2') {

                            removeAjaxLoad();
                            $('.delete_auth_body').html('<h5>'+data.message+'</h5>')
                            $('.auth_confrmremove_btn').data('action','counter_close_hold');
                            $("#authentication_modal").modal('show');

                          }else{
                              // $('.save_closing_balance').data('authCounterCloseWithHold',1);
                              loadLastClosedCounterReport(shift_id_update);
                              // let action = 'logout';
                              $('.modal_counter_close').modal('hide');
                              // location.reload();
                          }
                          
                          
                          // LoadPosContent();
                        }
                      }); 
                    }
                }
          },
          onContentReady: function () {
              // bind to events
              $('.jconfirm-buttons').addClass('full-width')
              var jc = this;
              this.$content.parents('.jconfirm').addClass('jconfirm_custom');
              this.$content.find('.job_search_txt').on('keyup', function (e) {
                let val = $(this).val();
                
                if(e.which == 13  || e.keyCode == 13)
                {
                  jc.$$ok.trigger('click');
                }
              }); 
          }
      });
})
$("body").on("click",".view_counter",function(){
  let shift_id  = window.localStorage.getItem('shift_id');
  loadLastClosedCounterReport(shift_id);
})
$("body").on("click",".counter_close_report_close_btn",function(){
  location.reload();
})
let loadLastClosedCounterReport = function(shift_id=0)
{
  let no_of_decimals   = window.localStorage.getItem('no_of_decimals');
  loadAjax()
  $.ajax({
      url      : base_url + "/pos_api/lastClosedCounterReport",
      type     : "POST",
      dataType : "JSON",
      data     : {'last_closed_shift':shift_id, 'client_identifier':client_identifier, 'branch_id': branch_id, 'user_id': user_id},
      success  : function(complete_data){
        removeAjaxLoad();
        let difference_amount=0;
        let tot_sale_amount = 0;
        let sale_total = 0;
        let sale_return_total = 0;
        if(complete_data.length > 0)
        {
          let counter_stopped = '-';
          let cash_expense    = '-';
          let cash_in_hand    = '-';
          let diff_amount     = '-';
          let expected_cash   = 0;
          
        let counterReportHTML = '<div class="row"><div class="col-md-12"><h1 class="head_title_h1">&nbsp;</h1></div></div>';
        counterReportHTML += '<div class="report_container_outer"><div class="report_container">';
        counterReportHTML += '<div class="report_header"><img src="'+complete_data[0]['logo_url']+'" class="logo_thermal" /></div>';
        counterReportHTML += '<div class="report_content">';
        counterReportHTML += '<div class="rowText"><h1>Counter Closing Reports</h1></div>';
        counterReportHTML += '<div class="rowText"><p>Username:<span>'+complete_data[0]['shift_username']+'</span></p></div>';
        counterReportHTML += '<div class="rowText"><p>Counter Started:<span>'+complete_data[0]['shift_start']+'</span></p></div>';
        counterReportHTML += '<div class="rowText"><p>Counter End:<span>'+counter_stopped+'</span></p></div>';
        counterReportHTML += '<div class="rowText doubleDashedLine"></div>';
        counterReportHTML += '<div class="rowText"><p>Opening Counter Cash in Hand:<span>'+Number(complete_data[0]['opening_counter_amount']).toFixed(no_of_decimals)+'</span></p></div>';
        let sale_details = complete_data[0]['amount_recieved_details'];
        // console.log(sale_details);
        sale_details.forEach(function(sale, index)
              {
                // console.log('acc_name1 ------- '+sale['acc_name1']);
                sale_total += Number(sale['receiptCash']);
                sale_return_total += Number(sale['returnCash']);
                if(sale['payment_method'].toLowerCase() == 'cash')
                  tot_sale_amount += Number(sale['receiptCash']);
                counterReportHTML += '<div class="rowText"><p>'+sale['payment_method']+':<span>'+Number(sale['receiptCash']).toFixed(no_of_decimals)+'</span></p></div>';
              })
              expected_cash = ((Number(complete_data[0]['opening_counter_amount'])+Number(tot_sale_amount)-Number(complete_data[0]['counter_expense_amount'])-Number(sale_return_total)));
              difference_amount = Number(complete_data[0]['amount_collected'])-((Number(complete_data[0]['opening_counter_amount'])+Number(tot_sale_amount)-Number(complete_data[0]['counter_expense_amount'])-Number(sale_return_total)));
              if(complete_data[0]['status']==0)
          {
            counter_stopped   = complete_data[0]['shift_end'];
            cash_expense    = Number(complete_data[0]['counter_expense_amount']).toFixed(no_of_decimals);
            cash_in_hand    = Number(complete_data[0]['amount_collected']).toFixed(no_of_decimals);
            diff_amount     = Number(difference_amount).toFixed(no_of_decimals);
            expected_cash   = Number(expected_cash).toFixed(no_of_decimals);
          }
        counterReportHTML += '<div class="rowText singleLine"><p>Total Payment:<span>'+Number(sale_total).toFixed(no_of_decimals)+'</span></p></div>';
        counterReportHTML += '<div class="rowText"><p>Payment Return:<span>'+Number(sale_return_total).toFixed(no_of_decimals)+'</span></p></div>';
        counterReportHTML += '<div class="rowText"><p>Cash Expense:<span>'+cash_expense+'</span></p></div>';
        counterReportHTML += '<div class="rowText doubleDashedLine"></div>';
        counterReportHTML += '<div class="rowText"><p>Cash Expense:<span>'+expected_cash+'</span></p></div>';
        counterReportHTML += '<div class="rowText"><p>Cash in hand:<span>'+cash_in_hand+'</span></p></div>';
        counterReportHTML += '<div class="rowText"><p>Difference:<span>'+diff_amount+'</span></p></div>';
        let productData    = complete_data[0]['productData'];
        let productData_keys  = Object.keys(productData); 
        let productData_length= productData_keys.length;
        console.log("productData.length - "+productData_length)
        console.log(productData)
        if(productData_length > 0 )
        {
          counterReportHTML += '<div class="rowText doubleDashedLine"></div>';
          counterReportHTML += '<div class="rowText"><h2>Invoice product details</h2></div>';
          $.each(productData,function(each_category,product_details)
                {
                  counterReportHTML += '<div class="rowText singleLine"><p>'+product_details[0]['cat_name']+'</p></div>';
                  product_details.forEach(function(product, index)
                  {
                    counterReportHTML += '<div class="rowText"><p>'+product['product_name1']+':<span>'+product['total_qty']+'</span></p></div>';
                  })
                })
        }
        counterReportHTML += '</div>';
        counterReportHTML += '</div>';
        
        
        counterReportHTML += '</div>';
        counterReportHTML += '<div class="col-md-12 rowText settings_btns" style="display:block"><button type="button" class="btn btn-dark counter_close_report_close_btn">Close</button></div>';
        $('.modal_counter_close_report_body').html(counterReportHTML);
        $(".modal_counter_close_report").modal({backdrop: 'static', keyboard: false});
        }
      }
    });
}

function removeAjaxLoad()
{
  $('.loading').remove();
  // setTimeout(function(){ $('.loading').remove();},100);
}
function loadAjax(mode=0,msg="")
{
  let msgTxt = '';
  //if(mode==1)
   // msgTxt = '<p class="powerMsg">'+msg+'</p>';
  $('body').prepend("<div class='loading'>"+msgTxt+"<i class='fa fa-spinner fa-pulse fa-3x fa-fw'></i></div>");
  // $('.loading').removeClass('invisibl');
}




// choose service page eye show dropdown by sarafali
function toggleCart() {
      const cartList = document.getElementById("cartList");
      if (cartList.style.display === "none" || cartList.style.display === "") {
        cartList.style.display = "block";
      } else {
        cartList.style.display = "none";
      }
    }

    // Hide dropdown when clicking outside
    document.addEventListener("click", function (event) {
      const cartContainer = document.getElementById("cartContainer");
      const cartList = document.getElementById("cartList");

      if (!cartContainer.contains(event.target)) {
        cartList.style.display = "none";
      }
    });





// cart list page qty add and reduce by sarafali
let qty = 2; // Initial quantity value

function changeQty(value) {
  const qtyDisplay = document.getElementById("qtyDisplay");
  qty += value;
  if (qty < 0) qty = 0; // Prevent negative quantity
  qtyDisplay.textContent = qty;
}




// custome select box

// time slot dropdown
$(document).ready(function() {
    $.ajax({
        url: api_url + '/packing_api/get_slot_times',
        type: "POST",
        dataType: "json",
        data     : {'client_identifier':client_identifier},
        success: function(data) {
            if (data.length > 0) {
                $.each(data, function(index, item) {
                    $("#time_picker").append(
                        $("<option>", {
                            value: item.id,   
                            text: item.delivery_slot
                        })
                    );
                });
            }
        },
        error: function(xhr, status, error) {
            console.error("Error fetching slots:", error);
        }
    });
});

// search customer 
function isMobileNumber(val){
      if (val != 0 && val != "" && val != null) {
        this_val = val.trim();
        let value_array = this_val.split("");
        let firstTwoDigit = this_val.substring(0, 2);
        let mobile_number_format = "05xxxxxxxx";
        let firstTwoDigitMobile = mobile_number_format.substring(0, 2);
        let trimmed_value = this_val.slice(2)

        if (firstTwoDigit == firstTwoDigitMobile && value_array.length == 10 ) {
          return true
        }else{
          return false;
        }
      }else{

        return false;
      }
}
$(document).ready(function() {
    var $searchInput = $('.choosecustsearch');
    var $resultsContainer = $('#chooseCustomerModal .modal-body .container');
    $searchInput.on('input', function() {
        var searchValue = $(this).val().trim();
        if (searchValue.length === 0) {
            $resultsContainer.find('.customer-results').remove();
            return;
        }
        $.ajax({
            url: api_url + '/packing_api/search_customers',
            type: 'POST',
            dataType: 'json',
            data: {
                'client_identifier': client_identifier,
                'branch_id': branch_id,
                'search_value': searchValue,
                'limit': 10,
                'start': 0
            },
            success: function(data) {
                $resultsContainer.find('.customer-results').remove();
                var $wrapper = $('<div>', {class: 'customer-results'});
                if (data.length > 0) {
                 $.each(data, function(index, cust){
                 let mobile_number_format = "05xxxxxxxx";
                  let mob='';
                  if(isMobileNumber(searchValue)){
                    //console.log('valid custmob')
                    mob = cust.mobile || cust.telephone;
                  }else{
                    //console.log('else')
                    let raw = cust.mobile || cust.telephone || '';
                    raw = raw.toString().trim();
                     if (raw.length >= 3) {
                        let last3 = raw.slice(-3);
                        // Replace only the last 3 characters of the format string with last3
                        let masked = mobile_number_format.slice(0, -3) + last3;
                        mob = masked;
                        
                    } 
                  }
                  //console.log('mob=',mob)
                   var html = `
                    <div class="customer-card"
                        data-customer-id="${cust.cust_id || ''}"
                        data-name="${cust.acc_name1 || ''}"
                        data-phone="${mob}"
                        data-outstanding="${cust.outstanding ? parseFloat(cust.outstanding).toFixed(2) : '0.00'}"
                        data-avatar="${cust.profile_image ? cust.profile_image : 'https://bootdey.com/img/Content/user_1.jpg'}"
                        data-last_invoice_amount="${cust.last_invoice_amount ? parseFloat(cust.last_invoice_amount).toFixed(2) : '0.00'}"
                        data-last_invoice_date="${cust.last_invoice_date || ''}"
                        style="display: flex; align-items: center; background: #fff; border-bottom: 1px solid #e5e5e5; padding: 16px 12px;">
                        <!-- Avatar Image -->
                        <div class="customer-avatar" style="width:42px; height:42px; margin-right:16px;">
                            <img src="${cust.profile_image ? cust.profile_image : 'https://bootdey.com/img/Content/user_1.jpg'}" alt="" style="width:42px; height:42px; border-radius: 50%; object-fit: cover; background: #f1f1f1;" />
                        </div>
                        <!-- Main Info -->
                        <div style="flex:1;">
                            <div style="font-weight:600; font-size:16px; color:#212529;">${cust.acc_name1}</div>
                            <div style="color:#6c757d; font-size:13px; margin-top:2px;">
                                ${mob}
                                <span style="margin-left:12px;">| Current Outstanding: <span style="font-weight:bold;">${cust.outstanding ? parseFloat(cust.outstanding).toFixed(2) : '0.00'}</span></span>
                            </div>
                            <div style="font-size:12px; color:#888; margin-top:6px;">
                                Invoiced <span style="font-weight:bold;">${(cust.last_invoice_amount ? parseFloat(cust.last_invoice_amount).toFixed(2) : '0.00')} AED </span> on <span>${cust.last_invoice_date || ''}</span>
                            </div>
                        </div>
                    </div>`;
                    $wrapper.append(html);
                });
                } else {
                    $wrapper.append('<div style="padding:20px;">No customers found.</div>');
                }
                $resultsContainer.append($wrapper);
            },
            error: function(xhr, status, error) {
                $resultsContainer.find('.customer-results').remove();
                $resultsContainer.append('<div style="color:red; padding:20px;">Error fetching customers.</div>');
            }
        });
    });
});


$(document).ready(function() {
  $(document).on('click', '.customer-card', function() {
    if ($(this).hasClass('selected')) {
      $(this).removeClass('selected');
      $('#addNewCustomerBtn').text('Add New Customer');
    } else {
      $('.customer-card.selected').removeClass('selected');
      $(this).addClass('selected');
      $('#addNewCustomerBtn').text('Select Customer');
    }
  });

 
  $('#addNewCustomerBtn').on('click', function() {
      var $selectedCard = $('.customer-card.selected');
      var btnText = $(this).text().trim();

      if (btnText === 'Add New Customer') {
          $('#addNewCustomerModal').modal('show');
          return;
      }
      if (!$selectedCard.length) {
          $.confirm({
              title: false,
              content: 'please select a customer',
              type: 'yellow',
              buttons: { ok: { text: 'OK', btnClass: 'btn-warning' } }
          });
          return;
      }

      var customerName = $selectedCard.data('name') || '';
      var customerPhone = $selectedCard.data('phone') || '';
      var currentOutstanding = $selectedCard.data('outstanding') || '0.00';
      var avatar = $selectedCard.data('avatar') || 'https://bootdey.com/img/Content/user_1.jpg';
      var lastInvoiceAmount = $selectedCard.data('last_invoice_amount') || '0.00';
      var lastInvoiceDate = $selectedCard.data('last_invoice_date') || '';
      var customerId = $selectedCard.data('customer-id'); 
      $.ajax({
          url: api_url + '/packing_api/get_shipping_addresses_by_customer',
          type: 'POST',
          dataType: 'json',
          data: { 
              customer_id: customerId, 
              client_identifier: client_identifier 
          },
          success: function(response) {
            var addresses = response.addresses;
            var areas = response.areas;
            var addressesHtml = '';
            addressesHtml = '<div style="display:flex;"><div style="margin-top:23px;font-size: 14px;"><b>Shipping Addresses 🛒:</b></div>'
              + '<div style="margin-left:33%;margin-top:17px"><button type="button" id="addNewCustomerAddrBtn" class="add_addr_btn">Add</button></div></div>';
            addressesHtml += '<ul  class="shipping_ul" style="list-style:none; padding-left:0;margin-top: 8px;">';

            if (addresses.length > 0) {
                addresses.forEach(function(addr) {
                    // var isDefault = addr.is_default == 1;
                    addressesHtml += `
                    <li style="padding:6px; border:1px solid #ddd; background:#fff">
                        <label style="cursor:pointer; display:block;">
                            <input type="radio" name="shippingAddress" class="shipping-address-radio" value="${addr.id}" data-shipping-area="${addr.shipping_area}" ${addr.is_default == 1 ? 'checked' : ''} />
                            <span style="margin-left:6px;">${addr.shipping_address}</span> |
                            <span style="margin-left:6px;">${addr.shipping_mobile}</span><br>
                            <span style="margin-left:6px;">${addr.shipping_name}</span> |
                            <span style="margin-left:6px;" id="selected_area_name">${addr.area_name}</span>
                            ${addr.is_default == 1 ? '<strong style="color:#2ca843; margin-left:8px;"></strong>' : ''}
                        </label>
                    </li>`;
                });
            } else {
                addressesHtml += `
                    <li>
                    </li>`;
            }

            addressesHtml += '</ul>';
            addressesHtml += `
                <label style="margin-top:10px; display:block; font-weight:bold;">
                  Shipping Area 📍:
                  <select id="shippingAreaDropdown" class="form-control" style="margin-top:6px;">
                    <option value="">Select area</option>
                    ${areas.map(area => `<option value="${area.id}">${area.area_name}</option>`).join('')}
                  </select>
                </label>`;

              $('#selectedCustomerContainer').off('change', '.shipping-address-radio').on('change', '.shipping-address-radio', function() {
              $('#selectedCustomerContainer li').css('background', '#fff');
              $('#selectedCustomerContainer input.shipping-address-radio:checked').closest('li').css('background', '#88c7eb');
              $(this).closest('li').css('background', '#88c7eb');
              window.defaultPickupId = $(this).val();
              var shippingAreaId = $(this).data('shipping-area');
              window.selectedShippingAreaId = shippingAreaId || 0;
              $('#shippingAreaDropdown').val(shippingAreaId);
            });

            $('#selectedCustomerContainer').off('change', '#shippingAreaDropdown').on('change', '#shippingAreaDropdown', function() {
              window.selectedShippingAreaId = $(this).val();
            });
            var shippingAreaDropdownHtml = buildShippingAreaDropdown(areasArray, null);
            var selectedCustomerHtml = `
              <div class="panel" style="margin-top:20px;">
                <div class="panel-body">
                  <div class="media-main">
                    <div class="info">
                      <h4>${customerName}</h4>
                      <a class="phone">${customerPhone}</a> 
                      <label class="separation">&nbsp| &nbsp</label>
                      <label>Current Outstanding : <span>${currentOutstanding}</span></label>
                      <div style="font-size:12px; color:#888; margin-top:6px;">
                        Invoiced <span style="font-weight:bold;">${lastInvoiceAmount} AED</span> on <span>${lastInvoiceDate}</span>
                      </div>
                    </div>
                    <a class="pull-left" href="#">
                      <img class="thumb-lg img-circle bx-s" src="${avatar}" alt="Customer Image">
                    </a>
                  </div>
                   ${addressesHtml}
                </div>
              </div>
            `;
            $('#selectedCustomerContainer').html(selectedCustomerHtml);
            $('#selectedCustomerContainer li').css('background', '#fff');
            $('#selectedCustomerContainer input.shipping-address-radio:checked').closest('li').css('background', '#88c7eb')
            var selectedRadioArea = $('#selectedCustomerContainer .shipping-address-radio:checked').data('shipping-area');
            window.defaultPickupId = $('#selectedCustomerContainer .shipping-address-radio:checked').val();
            window.selectedShippingAreaId = selectedRadioArea || 0;
            $('#shippingAreaDropdown').val(selectedRadioArea);
            
            $('#chooseCustomerModal').modal('hide');
            $('#addNewCustomerBtn').text('Add New Customer');
            $('.customer-card.selected').removeClass('selected');
          }
      });
  });
  });

var areasArray = [];

$(document).ready(function() {
  $.ajax({
    url: api_url + '/packing_api/get_shipping_addresses_by_customer',
    type: 'POST',
    dataType: 'json',
    data: { 
      client_identifier: client_identifier,
      customer_id: null 
    },
    success: function(data) {
      areasArray = data.areas; 
    },
    error: function() {
      console.error("Failed to fetch shipping areas");
    }
  });
});

function buildShippingAreaDropdown(areas, selectedAreaId) {
  let options = '<option value="">Select Shipping Area</option>';
  areas.forEach(function(area) {
    let selected = area.id == selectedAreaId ? 'selected' : '';
    options += `<option value="${area.id}" ${selected}>${area.area_name}</option>`;
  });
  return ` <div style="font-size:14px;"><b>Shipping Area 📍</b></div><select id="shippingAreaNewCustomer" class="form-control mt-2">${options}</select>`;
}

$('#addCustomerForm').on('submit', function(e) {
  e.preventDefault();
  var customerName = $('#new_cust_name1').val().trim();
  var customerPhone = $('#new_cust_mobile').val().trim();
  var currentOutstanding = '0.00'; 
  var customerAddress = $('#new_cust_addr').val().trim();

  if (!customerPhone) {
    $('#addCustomerMsg').html('<div class="alert alert-danger">Please fill the Customer Mobile Number</div>');
    return;
  }
  if (!customerName) {
    $('#addCustomerMsg').html('<div class="alert alert-danger">Please fill the Customer name</div>');
    return;
  }
  if (!customerAddress) {
    $('#addCustomerMsg').html('<div class="alert alert-danger">Please fill the Customer Address</div>');
    return;
  }
    if (!/^\d+$/.test(customerPhone)) {
    $('#addCustomerMsg').html('<div class="alert alert-danger">Please enter only numeric characters for the Mobile Number.</div>');
    return;
  }

  checkMobileExists(customerPhone, function(exists) {
    if (exists) {
      $.confirm({
        title: false,
        content: 'The mobile number already exists. Please select any other number.',
        type: 'red',
        buttons: {
          ok: {
            text: 'OK',
            btnClass: 'btn-red'
          }
        }
      });
      return; 
    }
    var shippingAreaDropdownHtml = buildShippingAreaDropdown(areasArray, null);
    var selectedCustomerHtml =
    `<div class="panel" style="margin-top: 20px;">
      <div class="panel-body">
        <div class="media-main">
          <div class="info">
            <h4>${customerName}</h4>
            <a class="phone">${customerPhone}</a>
            <label class="separation">&nbsp| &nbsp</label>
            <label>Current Outstanding : <span>${currentOutstanding}</span></label>
            <div style="font-size:12px; color:#888;">
              Invoiced <span style="font-weight:bold;">0.00 AED</span> on <span>Nil</span>
            </div>
          </div>
          <a class="pull-left" href="#">
              <img class="thumb-lg img-circle bx-s" src="https://bootdey.com/img/Content/user_1.jpg" alt="Customer Image">
          </a>
        </div>  
        <div style="margin-top:30px;">
          <div style="display:flex;">
            <div style="font-size:14px;"><b>Shipping Addresses 🛒:</b></div>
              <div style="margin-left:28%; margin-top:-6px;">
                <button type="button" id="addNewCustomerAddrBtn" class="add_addr_btn">Add</button>
              </div>
            </div>
            <ul style="list-style:none; padding-left:0; margin-top:8px;">
            </ul>
            ${shippingAreaDropdownHtml}
          </div>
        </div>
      </div>  
    </div>`;

    $('#selectedCustomerContainer').html(selectedCustomerHtml);

    setTimeout(function() {
      $('#addNewCustomerModal').modal('hide');
      $('#chooseCustomerModal').modal('hide');
      $('#addCustomerForm')[0].reset();
      $('#addCustomerMsg').html('');
      $('#addNewCustomerBtn').text('Add New Customer');
    }, 1500);

  });
});


$(document).ready(function() {
  $('.submit_pickup button').on('click', function(e) {
    e.preventDefault();

    let shipping_Area_Id = null;
    let area1 = $('#shippingAreaDropdown').val();
    let area2 = $('#shippingAreaNewCustomer').val();
    
    if (area1 && area1 !== "") {
      shipping_Area_Id = area1;
    } else if (area2 && area2 !== "") {
      shipping_Area_Id = area2;
    }

    let page_name = document.location.pathname.split('/').pop();
    let is_request = (page_name === 'pickup_req.html') ? '1' : '0';

    var $customerCard = $('#selectedCustomerContainer .panel');
    if (!$customerCard.length) {
      $.confirm({
        title: false,
        content: 'please select a customer',
        type: 'blue',
        buttons: {
          ok: {
            text: 'OK',
            btnClass: 'btn-blue'
          }
        }
      });
      return;
    }
    if (page_name === 'pickup_req.html') {
      let slotDate = $('#today_date').val();
      let slotTime = $('#time_picker').val();
      let shippingArea = $('#shippingAreaDropdown').val();

      if (!slotDate) {
        $.confirm({
          title: false,
          content: 'Please select a Slot Date.',
          type: 'orange',
          buttons: {
            ok: { text: 'OK', btnClass: 'btn-warning' }
          }
        });
        return;
      }

      if (!slotTime || slotTime === 'select_timeslot_value') {
        $.confirm({
          title: false,
          content: 'Please select a Slot Time.',
          type: 'orange',
          buttons: {
            ok: { text: 'OK', btnClass: 'btn-warning' }
          }
        });
        return;
      }
    }
      if (!shipping_Area_Id || shipping_Area_Id === '') {
        $.confirm({
          title: false,
          content: 'Please select a Shipping Area.',
          type: 'orange',
          buttons: {
            ok: { text: 'OK', btnClass: 'btn-warning' }
          }
        });
        return;
      }
      var $shippingRadios = $('#selectedCustomerContainer input.shipping-address-radio');
      if ($shippingRadios.length === 0 || $shippingRadios.filter(':checked').length === 0) {
        $.confirm({
          title: false,
          content: 'Please select/add shipping address',
          type: 'orange',
          buttons: {
            ok: {
              text: 'OK',
              btnClass: 'btn-warning'
            }
          }
        });
        return;
      }

    // new address section:

    var customerName = $customerCard.find('h4').text().trim();
    var customerPhone = $customerCard.find('a.phone').text().trim();
    var customerAddress = $customerCard.find('h6').text().trim();

    var $checkedRadio = $('#selectedCustomerContainer input.shipping-address-radio:checked');
    var shipping_id = null;
    var shipping_address = null;
    var shipping_mobile = null;
    var shipping_name = null;

    if ($checkedRadio.length) {
            var $li = $checkedRadio.closest('li');
            var spans = $li.find('span');
            shipping_address = spans.eq(0).text().trim();
            shipping_mobile = spans.eq(1).text().trim();
            shipping_name = spans.eq(2).text().trim();
            shipping_id = 0;
    }

    var selectedRadio = $('#selectedCustomerContainer input.shipping-address-radio:checked');
    var pickupId = selectedRadio.length ? selectedRadio.val() : 0;
    
    // var user_id = typeof window.user_id !== 'undefined' ? window.user_id : null;
    // var branch_id = typeof window.branch_id !== 'undefined' ? window.branch_id : null;
    // var client_identifier = typeof window.client_identifier !== 'undefined' ? window.client_identifier : null;

    let slot_date = null, slot_time = null, pickup_remark = '', pickup_description = '', direct_link = '',   pickup_datetime = null;
    if (page_name === 'pickup_ord.html') {
      let now = new Date();
      let yyyy = now.getFullYear();
      let mm = String(now.getMonth() + 1).padStart(2, '0'); 
      let dd = String(now.getDate()).padStart(2, '0');
      let hh = String(now.getHours()).padStart(2, '0');
      let min = String(now.getMinutes()).padStart(2, '0');
      let ss = String(now.getSeconds()).padStart(2, '0');

      pickup_datetime = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    }
    
    let latitude_n = null;
    let longitude_n = null;
    let map_loc   = null;
    let map_apart = null;
    let map_name  = null;
    let map_other = null;
    if (page_name === 'pickup_req.html') {
      slot_date = $('#today_date').val() || null;
      let st = $('#time_picker').val();
      slot_time = (st && st !== 'select_timeslot_value') ? st : null;
      pickup_remark = $('.invoice_add_item textarea[placeholder="Enter Remarks"]').val() || '';
      pickup_description = $('.invoice_add_item textarea[placeholder="Remark Description"]').val() || '';
      direct_link = $('.locationurl input[type="text"]').val() || '';
      // var pickupId = window.defaultPickupId || 0;
      // var shippingAreaId = window.selectedShippingAreaId || 0;
      // var selectedRadio = $('#selectedCustomerContainer input.shipping-address-radio:checked');
      // var pickupId = selectedRadio.length ? selectedRadio.val() : 0;
    } else {
      pickup_remark = $('.invoice_add_item textarea[placeholder="Enter Remarks"]').val() || '';
      pickup_description = $('.invoice_add_item textarea[placeholder="Enter Description"]').val() || '';
      direct_link = $('.pickuplocation input[type="text"]').val() || '';
      // var pickupId = window.defaultPickupId || 0;
      // var shippingAreaId = window.selectedShippingAreaId || 0;
      map_loc = $('#shipping_id').data('loc_building');  
      map_apart = $('#shipping_id').data('loc_apartment');
      map_name = $('#shipping_id').data('loc_name');  
      map_other = $('#shipping_id').data('loc_other');
      // $("#customerDetailsModal").modal('hide');
      // $("#add_address").modal('hide');
    
      latitude_n = $('#shipping_id').data('latitude');  
      longitude_n = $('#shipping_id').data('longitude');
    }

    $.ajax({
      url: api_url + '/packing_api/save_pickup',
      method: 'POST',
      dataType: 'json',
      data: {
        is_request: is_request,
        slot_date: slot_date, 
        slot_time: slot_time,
        pickup_datetime: pickup_datetime,
        customer_id: null,
        customer_mobile: customerPhone,
        customer_name: customerName,
        customer_Address: customerAddress, 
        latitude: latitude_n,
        longitude: longitude_n,
        map_loc_building: map_loc,
        map_loc_apartment: map_apart,
        map_loc_name: map_name,
        shipping_other_info: map_other,
        direct_map_link: direct_link,
        shipping_id: null,
        assigned_driver_id: user_id,
        pickup_remark: pickup_remark,
        pickup_description: pickup_description,
        shipping_area_id : shipping_Area_Id,
        user_id: user_id,
        branch_id: branch_id,
        origin: '0',
        client_identifier: client_identifier,
        order_id: null,
        shipping_address: shipping_address,
        shipping_mobile: shipping_mobile,
        shipping_name: shipping_name,
        shipping_id:pickupId
        // pickup_status: '0'
      },
      success: function(response) {
        if (response.status === 'success') {
          let pickup_id_txt = '';
          if(is_request == 0) pickup_id_txt = '<br><br>Pickup ID: '+response.pickup_id;
          $.confirm({
            title: false,
            content: 'Saved successfully.'+pickup_id_txt,
            type: 'blue',
            buttons: {
              ok: {
                text: 'OK',
                btnClass: 'btn-blue'
              }
            }
          });
          $('.invoice_add_item textarea').val('');
          $('.locationurl input[type="text"], .pickuplocation input[type="text"]').val('');
          $('#selectedCustomerContainer').html('');
          $('#today_date').val('');
          $('#time_picker').val('select_timeslot_value');
        } else {
          $.confirm({
            title: false,
            content: response.message,
            type: 'orange',
            buttons: {
              ok: {
                text: 'OK',
                btnClass: 'btn-warning'
              }
            }
          });
        }
      },
      error: function() {
        $.confirm({
          title: false,
          content: 'Failed while saving',
          type: 'red',
          buttons: {
          ok: {
            text: 'OK',
            btnClass: 'btn-red'
            }
          }
        });
      }
    });
  });
});

// if customer already exist:

function checkMobileExists(mobile, callback) {
  $.ajax({
    url: api_url + '/packing_api/check_customer_mobile_exists',
    method: 'POST',
    dataType: 'json',
    data: {
      client_identifier: client_identifier,
      customer_mobile: mobile
    },
    success: function(response) {
      callback(response.exists);
    },
    error: function() {
      callback(false); 
    }
  });
}

$('#new_cust_mobile').on('blur', function() {
  var mobile = $(this).val().trim();
  if (mobile) {
    checkMobileExists(mobile, function(exists) {
      if (exists) {
        $.confirm({
          title: false,
          content: 'The mobile number already exists.<br>If you want to select the existing customer or create new?',
          type: 'red',
          buttons: {
            select: {
              text: 'Select Existing Customer',
              btnClass: 'btn-green exists-cust',
              action: function() {
                $('#addNewCustomerBtn').trigger('click');
                $('#addNewCustomerModal').find(':focus').blur();
                $('#addNewCustomerModal').modal('hide');
                $('.choosecustsearch').val(mobile);
                $('.choosecustsearch').trigger('input');
                setTimeout(function() {
                  var found = false;
                  $('.customer-results .customer-card').each(function() {
                    if ($(this).data('phone') == mobile) {
                      $('.customer-results .customer-card').removeClass('selected');
                      $(this).addClass('selected');
                      $('#addNewCustomerBtn').text('Select Customer');
                      setTimeout(function() {
                        $('#addNewCustomerBtn').trigger('click');
                      }, 50);
                      found = true;
                      return false; 
                    }
                  });
                  if (!found) {
                    $.alert('Customer not found in results!');
                  }
                }, 300);
              }
            },
            create: {
              text: 'Create New Customer',
              btnClass: 'btn-primary new-cust',
              action: function() {
                $('#addCustomerForm')[0].reset();
                $('#addCustomerMsg').html('');
                $('#addNewCustomerModal').modal('show');
                setTimeout(function() {
                  $('#new_cust_mobile').focus();
                }, 250); 
              }
            }
          }
        });
      }
    });
  }
});

$('#selectedCustomerContainer').on('click', '#addNewCustomerAddrBtn', function (e) {
  e.preventDefault();
  $('#addNewShippingAddressModal').modal('show'); 
});

$('#addShippingAddressForm').on('submit', function(e) {
    e.preventDefault();
    var modal = $('#addNewShippingAddressModal');
    var newCustMobile = modal.find('#new_cust_mobile').val().trim();
    var newCustName = modal.find('#new_cust_name1').val().trim();
    var newCustAddr = modal.find('#new_cust_addr').val().trim();
    var $msgBox = modal.find('#addCustomerMsg');
    $msgBox.html('');

    if (!newCustMobile) {
        $msgBox.html('<div class="alert alert-danger">Please fill the Customer Shipping Mobile Number</div>');
        return;
    }
    if (!newCustName) {
        $msgBox.html('<div class="alert alert-danger">Please fill the Customer Shipping Name</div>');
        return;
    }
    if (!newCustAddr) {
        $msgBox.html('<div class="alert alert-danger">Please fill the Customer Shipping Address</div>');
        return;
    }
    if (!/^\d+$/.test(newCustMobile)) {
        $msgBox.html('<div class="alert alert-danger">Please enter only numeric characters for the Mobile Number.</div>');
        modal.find('#new_cust_mobile').focus();
        return;
    }

    var $ul = $('#selectedCustomerContainer ul');
    if ($ul.length === 0) {
        var html = '<div style="display:flex;"><div style="margin-top:23px;font-size: 14px;"><b>Shipping Addresses 🛒:</b></div><div style="margin-left:33%;margin-top:17px"><button type="button" id="addNewCustomerAddrBtn" class="add_addr_btn">Add</button></div></div>';
        html += '<ul class="shipping_ul" style="list-style:none; padding-left:0;margin-top: 8px;border: solid 1px #bfb8b8;"></ul>';
        $('#selectedCustomerContainer').prepend(html);
        $ul = $('#selectedCustomerContainer ul');
    }
    $ul.find('input[type=radio]').prop('checked', false);

    var newAddressHtml = `
        <li style="padding:6px; border:1px solid #ddd;">
            <label style="cursor:pointer; display:block;">
                <input type="radio" name="shippingAddress" class="shipping-address-radio" value="0" data-shipping-area="" checked />
                <span style="margin-left:6px;">${newCustAddr || 'No Address Provided'}</span> |
                <span style="margin-left:6px;">${newCustMobile}</span><br>
                <span style="margin-left:6px;">${newCustName}</span> |
                <span style="margin-left:6px;" id="selected_area_name"></span>
            </label>
            <a href="javascript:" class="delete_sp">Remove</a>
        </li>
    `;
    $ul.append(newAddressHtml);

    $ul.find('li').css('background', '#fff');
    $ul.find('input.shipping-address-radio:checked').closest('li').css('background', '#88c7eb');

    $('#addShippingAddressForm')[0].reset();
    $msgBox.html('');
    $('#addNewShippingAddressModal').modal('hide');
});


$('#chooseCustomerModal').on('shown.bs.modal', function () {
  $('.choosecustsearch').focus();
});
$('#addNewCustomerModal').on('shown.bs.modal', function () {
  $('#new_cust_mobile').focus();
});

$('body').on('click','a.delete_sp',function(){
  $(this).parents('li').remove();
})
$(function(){
  $('#addNewShippingAddressModal').on('shown.bs.modal', function (e) {
    console.log('Modal shown event fired');
    var $input = $(this).find('#new_cust_mobile');
    $input.val($input.val());
    $input.trigger('focus').select();
  });
});
