let user_id               = window.localStorage.getItem('api_user_id');
let api_url               = window.localStorage.getItem('api_url');
client_identifier         = window.localStorage.getItem('client_identifier');
let branch_id             = window.localStorage.getItem('branch_id');
let currency_id           = window.localStorage.getItem('currency_id');
let user_type             = window.localStorage.getItem('profile_type');
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
      {
        let profile_avatar = window.localStorage.getItem('profile_avatar');
        let profile_name = window.localStorage.getItem('profile_name');
        let login_user = window.localStorage.getItem('profile_name')
        let profile_type = window.localStorage.getItem('profile_type');
        $('.profile_avatar').attr('src',profile_avatar);
        $('.profile_name').text(profile_name);
        $('.login_user').text('Logged In : ' + login_user);
        $('.profile_type').text(profile_type);
        LoadGeneralSettings();
      }
      if(page_name=='home_delivery.html'){
        let profile_avatar = window.localStorage.getItem('profile_avatar');
        let profile_name = window.localStorage.getItem('profile_name');
        let profile_type = window.localStorage.getItem('profile_type');
        $('.profile_avatar').attr('src',profile_avatar);
        $('.profile_name').text(profile_name);
        $('.profile_type').text(profile_type);
        LoadPendingOrder();
      }
      if(page_name=='pickup.html'){
        let profile_avatar = window.localStorage.getItem('profile_avatar');
        let profile_name = window.localStorage.getItem('profile_name');
        let profile_type = window.localStorage.getItem('profile_type');
        $('.profile_avatar').attr('src',profile_avatar);
        $('.profile_name').text(profile_name);
        $('.profile_type').text(profile_type);
        LoadPendingPickups();
      }
      if(page_name=='pickup_request.html'){
        let profile_avatar = window.localStorage.getItem('profile_avatar');
        let profile_name = window.localStorage.getItem('profile_name');
        let profile_type = window.localStorage.getItem('profile_type');
        $('.profile_avatar').attr('src',profile_avatar);
        $('.profile_name').text(profile_name);
        $('.profile_type').text(profile_type);
        LoadPendingPickups();
      }
      if(page_name=='order_details.html'){
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
  window.localStorage.setItem('api_user','');
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
  let shift_id     = window.localStorage.getItem('shift_id');
  if(shift_id == 0){
    let message = 'There is no shift opened.';
    //settleErrorPopup(message);
         // loadErrorPopup('Warning',message,'1');
    setTimeout(function(){
                    // console.log('I am inside scanned_order_no',scanned_order_no)
        $.confirm({
                title: false,
                content: message,
                type: 'orange',
                buttons: {
                  ok: {
                    text: 'OK',
                    btnClass: 'btn-warning'
                  }
                }
              });    
      },500);
  }
    
  if(reload)
    loadAjax();
    $.ajax({
        url: base_url+'/pos_api/getDeliveryData',
        method: 'POST',
        data: {'client_identifier': client_identifier,'branch_id':branch_id,'user_id':user_id,'shift_id':shift_id},
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
                console.log('resppooooooooo',response);
                currency_short = response.currency_short;
                no_of_decimals = response.no_of_decimals;
                $('.profile_avatar').attr('src',response.profile_path);
                $('.profile_name,.login_user_span').text(response.acc_name1);
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
                credit         = response.credit_details['credit']?response.credit_details['credit']:'0.00';
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
                allow_direct_scan = response.allow_direct_scan;

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
                if(allow_direct_scan == 1)
                {
                  $('#myscanCheck').show();
                  $('.scanbarcode_check').show();
                }
                else
                {
                  $('#myscanCheck').hide();
                  $('.scanbarcode_check').hide();
                }
                let payment_types = ``; let tot_collection;
                console.log(complete_payment_method)
                console.log(complete_payment_method.length)
                $.each(complete_payment_method,function(index,each_array){
                  console.log('collectionnn:',collection_data);
                   tot_collection = (collection_data[each_array[0]['linked_account']]) ? collection_data[each_array[0]['linked_account']] : '0.00';
                   if(index.toLowerCase() == 'complementary')return true;
                   let pay_icon = (index.toLowerCase() == 'cash') ? 'cash.svg' : 'card.svg';
                   payment_types += `<div class="col-xs-12 col-sm-12 col-md-12 mb-10 each_payment_mode" data-mode="${index}" data-linked="${each_array[0]['linked_account']}">
                                        <div class="col_inner_wrapper" data-paying_area="${index}">
                                          <img src="images/${pay_icon}"> <h4>${index} <span class="payment_method_${each_array[0]['linked_account']}">${tot_collection}</span></h4>
                                        </div>
                                      </div>`;
                  credit_payment =  `<div class="col-xs-12 col-sm-12 col-md-12 mb-10 each_payment_mode" data-mode="credit" data-linked="99">
                                        <div class="col_inner_wrapper" data-paying_area="credit">
                                          <img src="images/cash.svg"> <h4>Credit <span class="payment_method_99">${credit}</span></h4>
                                        </div>
                                      </div>`;
                });
                console.log(payment_types)
                $('.payment_methods_list').html(payment_types + credit_payment);
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
  let shift_id     = window.localStorage.getItem('shift_id');
  //alert(shift_id);
  if(shift_id == 0){
    let message = 'There is no shift opened.';
    //settleErrorPopup(message);
         // loadErrorPopup('Warning',message,'1');
    setTimeout(function(){
                    // console.log('I am inside scanned_order_no',scanned_order_no)
        $.confirm({
                title: false,
                content: message,
                type: 'orange',
                buttons: {
                  ok: {
                    text: 'OK',
                    btnClass: 'btn-warning'
                  }
                }
              });    
      },500);
  }
  $.ajax({
    url      : base_url+"/pos_api/fetchPendingDeliveries",
    data     : {'order_id':0,'user_id': user_id,'branch_id':branch_id,'client_identifier':client_identifier, 'filter_content': filter_search,'shift_id':shift_id},
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

                  new_bill_html += `<div class="col-sm-12 each_del_item" data-order="${bill.order_no}">
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
                                                <p class="text-muted">${address}</p>
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
              let scanned_order_no = window.localStorage.getItem('scanned_order_no');
              if (scanned_order_no) {
                  window.localStorage.removeItem('scanned_order_no');
                  setTimeout(function(){
                    // console.log('I am inside scanned_order_no',scanned_order_no)
                    $('.each_del_item[data-order="'+scanned_order_no+'"] .panel').trigger('click')
                  },500);
                  
              }


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

            console.log({response});

            removeAjaxLoad();
            console.warn(keep_driver_shift_separately,disable_shift_opening_closing_from_driver_app)
            
            if (response && response.not_settled_data && response.not_settled_data.length > 0) 
            {

              let old_coutner_opened = '';
              let old_coutner_closed = '';
              const tableRows = response.not_settled_data.map(item => {
                
                old_coutner_opened = item.shift_start;
                old_coutner_closed = item.shift_end;
                
                return `
                  <tr>
                    <td width="20%">${item.id}</td>
                    <td width="40%">${item.order_no}</td>
                    <td width="40%">${item.amount}</td>
                  </tr>
                `;
              }).join(''); 

              // Wrap the rows in the table structure
              const tableHTML = `
                <table border="1" style="width: 100%; border-collapse: collapse; text-align: left;">
                  <thead>
                    <tr style="background-color: #f2f2f2;">
                      <th width="20%">Shift ID</th>
                      <th width="40%">Order No</th>
                      <th width="40%">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tableRows}
                  </tbody>
                </table>
              `;


              html = `<p class="open_counter_p"><a href="javascript:" class="open_counter carry_forward">Open Counter</a></p>
<h3 style="color:red">Some orders from the previous shift are not yet settled. Please settle your previous orders with the cashier.</h3>
              <ul class="date total_balence">
                         <li>Counter Opened On</li>
                         <li><span class="counter_opened_on">${old_coutner_opened}</span></li>
                      </ul>
                      <ul class="date total_balence">
                         <li>Counter Closed On</li>
                         <li><span class="counter_open_amt">${old_coutner_closed}</span></li>
                      </ul>
                     `;

              html += tableHTML;
            }
            else if(response.shift_id > 0)
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
$('body').on('keypress','input.filter_content',function(e){
      
    if(e.which == 13  || e.keyCode == 13)
      {
        $('.filter_action').trigger('click');
      }
})
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
            let cust_address = order_details[0].address2 != "" ? order_details[0].address2 : order_details[0].customer_address;
            $('#order_id_share').val(order_id);
            $('#order_link_share').val(order_details[0].sharelink);
            $('.del_ord_no').text("Order #"+order_details[0].order_no);
            $('.del_cust_name').text(order_details[0].customer_name);
            $('.del_cust_address').text(cust_address);
            let rawUrl = order_details[0].shipping_location_url || '';
            if (rawUrl) {
              let url = rawUrl.trim();
              if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
              $('.del_cust_address_url').html('<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + rawUrl + '</a>');
            } else {
              $('.del_cust_address_url').text('');
            }
            $('.del_cust_mobile').text(order_details[0].customer_mobile);
            $('a.tele_mob').attr('href','tel:'+order_details[0].customer_mobile)
            $('a.tele_mob_wa').attr('href','https://wa.me/'+order_details[0].customer_mobile)
            // alert( order_details[0].customer_mobile);
            //$('a.tele_mob').attr('href','tel:+'+order_details[0].customer_mobile.replace('+', ''))

            // Remove old event handler to prevent stacking
            $('a.tele_mob').off('click');
            
            if(order_details[0].shipping_mobile != null  && order_details[0].shipping_mobile != order_details[0].customer_mobile)
            {
              // Store the current order mobile numbers in data attributes
              $('a.tele_mob').data('customer_mobile', order_details[0].customer_mobile);
              $('a.tele_mob').data('shipping_mobile', order_details[0].shipping_mobile);
              
              $('a.tele_mob').on('click', function(e){
                e.preventDefault();
                let customerMobile = $(this).data('customer_mobile');
                let shippingMobile = $(this).data('shipping_mobile');
                
                $.confirm({
                  title: 'Select Phone Number',
                  content: '' +
                    '<div class="form-group">' +
                    '<p>Please select which phone number to use for calling:</p>' +
                    '<label style="display: block; margin: 10px 0;"><input type="radio" name="select_mobile" value="customer" checked> Customer: ' + customerMobile + '</label>' +
                    '<label style="display: block; margin: 10px 0;"><input type="radio" name="select_mobile" value="shipping"> Shipping: ' + shippingMobile + '</label>' +
                    '</div>',
                  boxWidth: '80%',
                  useBootstrap: false,
                  type: 'blue',
                  buttons: {
                    cancel: {
                      text: 'Cancel',
                      action: function(){
                      }
                    },
                    ok: {
                      text: 'Ok',
                      btnClass: 'btn-blue',
                      action: function(){
                        let selected = $('input[name="select_mobile"]:checked').val();
                        let selectedMobile = selected === 'shipping' ? shippingMobile : customerMobile;
                        window.location.href = 'tel:' + selectedMobile;
                      }
                    }
                  }
                });
              });
            }
            else
            {

              // Store customer mobile for single number case
              $('a.tele_mob').data('customer_mobile', order_details[0].customer_mobile);
              $('a.tele_mob_wa').attr('href','https://wa.me/'+order_details[0].customer_mobile);
              
              $('a.tele_mob').on('click', function(e){
                e.preventDefault();
                let customerMobile = $(this).data('customer_mobile');
                window.location.href = 'tel:' + customerMobile;//here
              });
            }
            $('.del_order_date').text(order_details[0].order_date);
            $('.del_delivery_date').text(order_details[0].delivery_date);
            $('.tot_outstanding').text(order_details[0].cust_total_credit.toFixed(no_of_decimals) + ' '+currency_short);
            $('.tot_outstanding').data('total_outstanding',order_details[0].cust_total_credit.toFixed(no_of_decimals));
            $('.bill_tot_amount').text(Number(order_details[0].grand_total).toFixed(no_of_decimals) + ' '+currency_short);
            $('.bill_balance_amount').text(Number(order_details[0].balance).toFixed(no_of_decimals) + ' '+currency_short);
            $('.bill_balance_amount').data('balance_amt',Number(order_details[0].balance).toFixed(no_of_decimals));
            $('#customer_id').val(order_details[0].customer_id);
            $('#order_id').val(order_id);
            $('.print-btn').data('order',order_id);
            $('.delivery-btn').data('order',order_id);
            $('#credit_sale').val(credit_sale);
            $('#shipping_id').data('latitude',order_details[0].latitude);
            $('#shipping_id').data('longitude',order_details[0].longitude);
            $('#shipping_id').val(order_details[0].shipping_id);

            $('#shipping_id').data('loc_building',order_details[0].map_loc_building);  
            $('#shipping_id').data('loc_apartment',order_details[0].map_loc_apartment);
            $('#shipping_id').data('loc_name',order_details[0].map_loc_name);  
            $('#shipping_id').data('loc_other',order_details[0].shipping_other_info);
            if(order_details[0].shipping_id > 0){
              let query_string = order_details[0].latitude+','+order_details[0].longitude;
              if(query_string != 'null,null')
              {
                $('a.shipping').attr('href','https://maps.google.com/?q='+query_string)
              }
              else if(order_details[0].shipping_location_url != null && order_details[0].shipping_location_url != '')
              {
                // alert(order_details[0].shipping_location_url);
                $('a.shipping').attr('href', order_details[0].shipping_location_url)
              }
              else
              {
                $('a.shipping').hide();
              }
              let shipParts = [
                order_details[0].map_loc_building,
                order_details[0].map_loc_apartment,
                order_details[0].map_loc_name,
                order_details[0].shipping_other_info
              ].filter(v => v && v !== 'null' && v !== null);

              let shipadd = [
                order_details[0].shipping_mobile,
                order_details[0].shipping_name,
                order_details[0].shipping_address,
                order_details[0].shipping_area_name
              ].filter(v => v && v !== 'null' && v !== null);
              
              let ship_add = shipadd.join(', ');  
              let ship_to = shipParts.join(', ');    

              // small helper to escape text for HTML
              const esc = v => $('<div/>').text(v).html();

              let htmlParts = [];
              if (ship_add) htmlParts.push(`<div class="ship-add">${esc(ship_add)}</div>`);
              if (ship_to)  htmlParts.push(`<div class="ship-to">${esc(ship_to)}</div>`);

              if (htmlParts.length > 0) {
                $('.del_cust_shipping').html(htmlParts.join(''));
                $('.del_cust_shipping').parents('.col-sm-12').removeClass('hidden');
              } else {
                $('.del_cust_shipping').html('');
                $('.del_cust_shipping').parents('.col-sm-12').addClass('hidden');
              }
            }
            else
              $('.del_cust_shipping').parents('.col-sm-12').addClass('hidden')
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
$('body').on('click','.print-btn',function(){
  let order_id = $(this).data('order');
  loadAjax();
    $.ajax({
        url: base_url+'/pos_api/androidPrint',
        method: 'POST',
        data: {'client_identifier': client_identifier,'branch_id':branch_id,'order_id':order_id,'printing':'order','print_mode':'','UserType':user_type},
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
            $('.print_html').remove();
            $("body").append(print_data);
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
  let inputField = $(this).closest('.each_payment_method').find('.received_amt');
  inputField.val(balance).trigger('input'); // trigger event
})
$('body').on('click','.delivery-btn',function(){
  checkImageCount();
  let addr_lebel = 'Add Location';
  if($('#shipping_id').val() > 0)
  {
    addr_lebel = 'Update Location';
  }
  $('label[for="inlineCheckbox1"]').text(addr_lebel);
  let send_whatsapp = localStorage.getItem('send_whatsapp_on_deliver');
  if(send_whatsapp == 1)
    $('input#inlineCheckbox2').prop('checked',true);
  let order_id = $(this).data('order');
  let os = window.localStorage.getItem('installing_os');
  if(os == 'android'){
    ok.start_delivery(client_identifier, user_id);
  }
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
$('body').off('input.creditCheck').on('input.creditCheck', '.received_amt', function () {
    let hasValue = false;
    $('.received_amt').each(function () {
        let val = parseFloat($(this).val());
        if (!isNaN(val) && val > 0) {
            hasValue = true;
            return false; // break loop
        }
    });
    if (hasValue) {
        // Auto check
        $('#inlineCheckbox3').prop('checked', true);
        $('#credit_sale').val(1);
        // Hide checkbox section
        $('.credit-sale-wrapper').slideUp(150);
    } else {
        // Uncheck
        $('#inlineCheckbox3').prop('checked', false);
        $('#credit_sale').val(0);
        // Show checkbox again
        $('.credit-sale-wrapper').slideDown(150);
    }
});
$('body').on('change', '#inlineCheckbox3', function () {
    $('#credit_sale').val($(this).is(':checked') ? 1 : 0);
});
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
  // Sale checkbox NOT checked
  if (!$('#inlineCheckbox3').is(':checked')) {

      $.confirm({
          title: 'Warning!',
          content: 'Credit check is not enabled',
          buttons: {
              ok: {
                  text: 'OK',
                  btnClass: 'btn-blue',
                  action: function () {
                      
                  }
              }
          }
      });

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
    //$.alert('<b>Warning !</b><br>You cannot process this action, Please contact customer support.');
    $.alert('<b>Warning !</b><br>Shift is not opened. Please open the shift before continuing the delivery.');
    return false;
  }
  let order_delivery_details     = {};
  let update_location = $("#inlineCheckbox1").is(":checked") ? '1' : '0';
  let send_whatsapp = $("#inlineCheckbox2").is(":checked") ? '1' : '0';
  order_delivery_details['lat']       =  $('#shipping_id').data('latitude');
  order_delivery_details['lng']       =  $('#shipping_id').data('longitude');
  order_delivery_details['balance']       =  balance;
  order_delivery_details['customer_id']   =  customer_id;
  order_delivery_details['order_id']      =  order_id;
  order_delivery_details['order_images']  =  file_ids;
  order_delivery_details['shift_id']      =  shift_id;
  order_delivery_details['update_location'] =  update_location;
  order_delivery_details['send_whatsapp'] =  send_whatsapp;
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
                            let os =window.localStorage.getItem('installing_os');
                            if(os == 'android'){
                              ok.stop_delivery(client_identifier, user_id);
                            }
                            if(send_whatsapp == 1 && data.mob_for_whatsapp != 0)
                            {
                              // if(data.direct_whastapp == 1)
                              // {
                                let api = 'https://textconnect.aipsoft.com/api/send/whatsapp';
                                whatsapp_share_ajax(data.wa_data.sms_username,data.wa_data.sms_password,data.wa_data.message_text,data.mob_for_whatsapp,api);
                              // }
                              // else
                              // {
                              //   let whatsapp_pre_text = "https://wa.me/+"+data.whatsapp_response.mobile+"?text=";
                              //   var linkk = data.whatsapp_response.whatsapp_text;
                              //   var encodedURL = encodeURIComponent(linkk);
                              //   let whatsapp_full_text = whatsapp_pre_text+encodedURL;
                              //   console.log(whatsapp_full_text); 
                              //   $(".whatsapp_a").attr('href',whatsapp_full_text);
                              //   setTimeout(function() {
                              //     //document.getElementById("whatsapp_a").click();  
                              //       //$(".whatsapp_a").trigger('click');
                              //       $('#whatsapp_a')[0].click();
                              //       $('#whatsapp_a').mousedown();
                              //     },100);
                              // }
                            }
                            $.confirm({
                                title: 'Saving Successful',
                                content: 'Your delivery saved successfully.',
                                boxWidth: '50%',
                                useBootstrap: false,
                                icon: 'fas fa-exclamation-triangle',
                                backgroundDismissAnimation: 'glow',
                                type: 'green',
                                autoClose: 'redirectUser|800',
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
  if($(this).hasClass('carry_forward')){
    let message = 'Previous orders have been carried forward to the new shift.';
    //settleErrorPopup(message);
         // loadErrorPopup('Warning',message,'1');
    setTimeout(function(){
                    // console.log('I am inside scanned_order_no',scanned_order_no)
        $.confirm({
                title: false,
                content: message,
                type: 'orange',
                buttons: {
                  ok: {
                    text: 'OK',
                    btnClass: 'btn-warning'
                  }
                }
              });    
      },500);
  }
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
                                    data     : {'user_id':user_id,'counter_opening_amount':counter_opening_amount,'open_counter_denom':open_counter_denom, 'client_identifier': client_identifier, 'user_id': user_id, 'branch_id' : branch_id},
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
                          window.localStorage.setItem('last_shift_id','');
                            window.localStorage.setItem('api_user_id','');
                            // window.localStorage.setItem('client_identifier','');
                            window.localStorage.setItem('branch_id','');
                            window.localStorage.setItem('currency_id','');
                            window.localStorage.setItem('login_date','');
                            window.localStorage.setItem('counter_opened_date','');
                            window.localStorage.setItem('counter_opened_time','');

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
          let inv_paid_amount = complete_data[0]['amount_recieved_details'];
          let sale_inv_total = 0;
          inv_paid_amount.forEach(function(sale, index)
          {
            sale_inv_total += Number(sale['receiptCash']);
          })
          
        let counterReportHTML = '<div class="row"><div class="col-md-12"><h1 class="head_title_h1">&nbsp;</h1></div></div>';
        counterReportHTML += '<div class="report_container_outer"><div class="report_container">';
        counterReportHTML += '<div class="report_header"><img src="'+complete_data[0]['logo_url']+'" class="logo_thermal" /></div>';
        counterReportHTML += '<div class="report_content">';
        counterReportHTML += '<div class="rowText"><h1>Counter Closing Reports</h1></div>';
        counterReportHTML += '<div class="rowText"><p>Username:<span>'+complete_data[0]['shift_username']+'</span></p></div>';
        counterReportHTML += '<div class="rowText"><p>Company name:<span>'+client_identifier+'</span></p></div>';
        counterReportHTML += '<div class="rowText"><p>Counter Started:<span>'+complete_data[0]['shift_start']+'</span></p></div>';
        counterReportHTML += '<div class="rowText"><p>Counter End:<span>'+counter_stopped+'</span></p></div>';
        counterReportHTML += '<div class="rowText doubleDashedLine"></div>';
        counterReportHTML += '<div class="rowText"><p>Total Invoice Count: <span>'+complete_data[0]['invoice_total_details'][0]['total_count']+'</span></p></div>';
        counterReportHTML += '<div class="rowText"><p>Total Invoice Amount: <span>'+Number(complete_data[0]['invoice_total_details'][0]['invoice_total']).toFixed(no_of_decimals)+'</span></p></div>';
        counterReportHTML += '<div class="rowText singleLine"><p>Total Payment:<span>'+Number(sale_inv_total).toFixed(no_of_decimals)+'</span></p></div>';
        counterReportHTML += '<div class="rowText"><p>Total Outstanding Balance: <span>'+Number(complete_data[0]['invoice_total_details'][0]['credit_balnce']).toFixed(no_of_decimals)+'</span></p></div>';
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
        counterReportHTML += '<div class="rowText"><p>Cash Expected:<span>'+expected_cash+'</span></p></div>';
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

let lookedUpOrders = [];

$(document).ready(function() {
  $('#scanBarcodeBtn').on('click', function () {
    $('#barcodeModal').modal('show');
     setTimeout(function() {
      $('#barcodeInput').focus();
      open_camera();//here
    }, 500);
  });
  $('#searchBtn').on('click', searchdeliveryorder);
  $('#barcodeInput').on('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchdeliveryorder();
    }
  });
   $('#searchResults').on('click', 'button[data-action="delete"]', function() {
    const orderNo = $(this).data('order-no');
    lookedUpOrders = lookedUpOrders.filter(o => o.order_no !== orderNo);
    $(this).closest('.search-item').remove();
    toggleAddOrderBtn();
  });
});


function showSearchError(msg) {
  $('#searchError').text(msg).removeClass('d-none');
}

function clearSearchError() {
  $('#searchError').addClass('d-none').text('');
}
function toggleAddOrderBtn() {
  if (lookedUpOrders.length > 0) {
    $('#addOrderBtn').removeClass('d-none');
  } else {
    $('#addOrderBtn').addClass('d-none');
  }
}

$('#barcodeModal').on('hidden.bs.modal', function () {
  lookedUpOrders = [];
  $('#barcodeInput').val('');
  $('#searchResults').empty();
  clearSearchError();
  $('#addOrderBtn').addClass('d-none');
  location.reload();
});


function searchdeliveryorder() {  
  clearSearchError();
  const orderNo = $('#barcodeInput').val().trim();
  const singleScan = $('#myscanCheck').is(':checked');
  let shift_id = localStorage.getItem('shift_id');
  if (!orderNo) {
    $('#barcodeInput').val('').focus();
    return showSearchError('Please scan or type an order number.');
  }

  if (!singleScan && lookedUpOrders.some(o => o.order_no === orderNo)) {
    $('#barcodeInput').val('').focus();
    return showSearchError(`Order ${orderNo} is already in the list.`);
  }

  $.ajax({
    url: api_url + '/packing_api/searchdeliveryorder',
    method: 'POST',
    dataType: 'json',
    data: {
      del_oredrno:       orderNo,
      client_identifier: client_identifier,
      user_id:           user_id,
      shift_id: shift_id
    }
  })
  .done(function(res) {
    if (!res.ok) {
      $('#barcodeInput').val('').focus();
      return showSearchError(res.message);
    }
    else{
      showToaster(200, res.message);//here
      $('#barcodeInput').val('').focus();
      open_camera();
    }
     if (singleScan) {
      doAddDeliveryOrders(
        [ res.data ],
        function(addRes) {
          if (!addRes.ok) {
            $('#barcodeInput').val('').focus();
            return showSearchError(addRes.message);
          }
          $('#barcodeModal').modal('hide');
          window.localStorage.setItem('scanned_order_no', orderNo);
          window.location = "home_delivery.html";
        }
      );

    } else {
    if(res.data != '0')
    {
      lookedUpOrders.unshift(res.data);
      renderSearchResults();
    }
    $('#barcodeInput').val('').focus();
    }
  })
  .fail(function(){
    showSearchError('Network or server error.');
  });
}

function renderSearchResults() {
  const $c = $('#searchResults').empty();
  lookedUpOrders.forEach(d => {
    $c.append(`
      <div class="search-item mb-0" data-order-no="${d.order_no}">
        <div class="search-card p-2 rounded bg-light position-relative">
          <button type="button" class="btn btn-sm btn-danger position-absolute" style="top:12px; right:5px; z-index: 100;" data-action="delete" data-order-no="${d.order_no}">×</button>
          <div class="row">
            <div class="col-6">
              <strong>${d.customer_name}</strong><br>
              <small>${d.customer_mobile}</small>
            </div>
            <div class="col-6 text-right"style="padding-right: 45px;">
              <strong>${d.order_no}</strong><br>
              <small>${d.order_date}</small>
            </div>
          </div>
        </div>
        <hr style="margin-top: -2px;">
      </div>`);
  });
  toggleAddOrderBtn();//here
}

 function setDelayItem(str)
   {
    $('#barcodeInput').val(str);
    // $('#myBtn').click();
    $('#barcodeInput').trigger($.Event('keydown', { which: 13, keyCode: 13, key: 'Enter' }))
                  .trigger($.Event('keypress', { which: 13, keyCode: 13, key: 'Enter' }))
                  .trigger($.Event('keyup', { which: 13, keyCode: 13, key: 'Enter' }));
   }

// Show toaster notification function
function showToaster(response_code, message) {
  if (typeof toastr === 'undefined') {
    console.log('Toastr not loaded');
    return;
  }
  toastr.options = {
    "closeButton": true,
    "newestOnTop": true,
    "progressBar": true,
    "positionClass": "toast-top-center"
  };
  
  if (response_code == 200 || response_code == 201) {
    toastr.success('Success', message);
  } else if (response_code == 501) {
    toastr.error('Error', message);
  } else if (response_code == 400) {
    toastr.warning('Warning', message);
  } else {
    toastr.info('Info', message);
  }
}

function doAddDeliveryOrders(orders, onSuccess, onError) {
  let shift_id = localStorage.getItem('shift_id');
  if (!shift_id) {
    return showSearchError('No shift selected.');
  }
  $.ajax({
    url: api_url + '/packing_api/adddeliveryorders',
    method: 'POST',
    dataType: 'json',
    data: {
      client_identifier: client_identifier,
      user_id:           user_id,
      shift_id:          shift_id,
      orders:            JSON.stringify(orders)
    }
  })
  .done(function(res) {
    // Store toaster message in localStorage before navigation
    if (res && res.ok) {
      localStorage.setItem('delivery_order_toaster', JSON.stringify({
        type: 200,
        message: res.message || 'Order added successfully!'
      }));
    } else {
      localStorage.setItem('delivery_order_toaster', JSON.stringify({
        type: 501,
        message: res.message || 'Failed to add order.'
      }));
    }
    // Call the original onSuccess if provided
    if (onSuccess) {
      onSuccess(res);
    }
  })
  .fail(function(xhr, status, error) {
    // Store error message in localStorage
    let errorMessage = 'Server error, please try again.';
    if (xhr.responseJSON && xhr.responseJSON.message) {
      errorMessage = xhr.responseJSON.message;
    }
    localStorage.setItem('delivery_order_toaster', JSON.stringify({
      type: 501,
      message: errorMessage
    }));
    // Call the original onError if provided
    if (onError) {
      onError(xhr, status, error);
    } else {
      showSearchError(errorMessage);
    }
  });
}

$('#addOrderBtn').on('click', function(e) {
  e.preventDefault(); // Good practice to prevent default button behavior
  clearSearchError();

  doAddDeliveryOrders(lookedUpOrders,
    function(res) {
      // 1. Success Callback Logic
      if (res && res.ok === true) {
        // ONLY redirect if the server explicitly said 'ok' => TRUE
        $('#barcodeModal').modal('hide');
        lookedUpOrders = [];
        renderSearchResults();
        window.location.replace('landing.html');
      } else {
        // If 'ok' is FALSE or missing, do NOT redirect.
        // The toaster is already saved in localStorage by doAddDeliveryOrders,
        // but since we aren't navigating, we should show the error on the current page.
        showSearchError(res.message || 'Failed to add order.');
      }
    },
    function(xhr, status, error) {
      // 2. Error Callback Logic (JSON errors or Server 500 errors)
      // We do NOT call window.location.replace here.
      // This allows the user to stay on the page and see what went wrong.
      
      let errorMessage = 'Server error or invalid response.';
      if (xhr.responseJSON && xhr.responseJSON.message) {
        errorMessage = xhr.responseJSON.message;
      }
      
      // Update the UI so the user knows there was a JSON/Network error
      showSearchError(errorMessage);
    }
  );
});

$(document).on('click', function(event) {
    var $navbar = $('.navbar-collapse.bg-dark.collapse.show');
    if ($navbar.length && $(event.target).closest('.navbar-collapse').length === 0 && $(event.target).closest('.navbar-toggler').length === 0) {
        $navbar.collapse('hide');
    }
});


function LoadPendingPickups(filter_search='') {
  let page_name = document.location.pathname.match(/[^\/]+$/)[0];
  // Show loader, hide previous results
  $('.delivery_orders').hide();
  $('.pickup-loader').show();
  let loadStart = Date.now();

  $.ajax({
    url: base_url + "/Packing_api/fetchPendingPickup",
    data: {
      'order_id': 0,
      'user_id': user_id,
      'branch_id': branch_id,
      'client_identifier': client_identifier,
      'filter_content': filter_search,
      'page_name': page_name
    },
    type: "POST",
    dataType: "JSON",
    success: function(full_data) {
      let pickup_data = full_data[0];         
      let user_status = full_data[1];
      let new_bill_html = '';
      let main_label_txt = 'Pickup';
      let font_color = '#c38c00';
      if(page_name == 'pickup_request.html'){
       main_label_txt = 'Pickup Request';
       font_color = '#c73737';
     }
      if (user_status == 0) {
        new_bill_html = '<div class="col-sm-12">No '+main_label_txt+'s found.</div>';
      } else if (pickup_data && pickup_data.length > 0) {
        pickup_data.forEach(function(pickup, i) { 
          let customerName = pickup.customer_name || '(No name)';
          let customerPhone = pickup.customer_mobile || '';
          let currentOutstanding = pickup.outstanding || '0.00';
          let invoiced = pickup.last_invoice_amount || '0.00';
          let invoice_date = pickup.last_invoice_date || '';
          let defaultAddress = pickup.shipping_address || '';
          new_bill_html += `
            <div class="col-sm-12 each_del_items" data-id="${pickup.id}" style="cursor:pointer;">
              <div class="panel" style="margin-top: 20px;">
                <div class="panel-body">
                  <div class="media-main" style="display: flex; align-items: center;">
                    <div class="info" style="flex:1;">
                      <h4>${customerName}</h4>
                      <h6>${defaultAddress}</h6>
                      <a class="phone">${customerPhone}</a>
                      <label class="separation" style="margin-bottom:0">&nbsp;|&nbsp;</label>
                      <label>Current Outstanding : <span>${currentOutstanding}</span></label>
                    </div>
                    <a class="pull-left" href="#">
                      <img class="thumb-lg img-circle bx-s" src="https://bootdey.com/img/Content/user_1.jpg" alt="Customer Image" style="width:42px; height:42px; border-radius:50%; object-fit: cover;" />
                    </a>
                  </div>
                  <ul class="date" style="font-size:12px; color:${font_color}; margin:0px; padding-left:17px; font-weight:bold">
                    <li>${main_label_txt} ID: <span>${pickup.id}</span></li>
                    <li>${main_label_txt} Date: <span>${pickup.slot_date || ''}</span></li>
                    <li>Invoiced: <span>${(invoiced ? parseFloat(invoiced).toFixed(2) : '0.00')} AED </span> on <span>${invoice_date || 'Nill'}</span></li>
                  </ul>
                  <hr>
                </div>
              </div>
            </div>`;
        });
      } else {
        new_bill_html = `<div class="col-sm-12">No ${main_label_txt}s found.</div>`;
      }
      // Ensure loader is visible for at least 1.5s
      let delay = Math.max(0, 1500 - (Date.now() - loadStart));
      setTimeout(function() {
        $('.pickup-loader').hide();
        $('.delivery_orders').html(new_bill_html).show();
      }, delay);
    },
    error: function() {
      setTimeout(function() {
        $('.pickup-loader').hide();
        $('.delivery_orders').html('<div class="col-sm-12">Error loading pickups.</div>').show();
      }, 1500);
    }
  });
}


$(document).on('click', '.each_del_items', function(e) {
  e.preventDefault();
  let pickupId = $(this).data('id');
  if(!pickupId) return alert('Invalid pickup id');

  $.ajax({
    url: base_url + '/Packing_api/getPickupDetails',
    type: 'POST',
    data: { id: pickupId, client_identifier: client_identifier },
    dataType: 'JSON',
    success: function(res) {
      if(res && res.success && res.data) {
        let p = res.data;
        $('#pickup_id').val(p.id);
        $('#customer_name').val(p.customer_name || '');
        $('#customer_mobile').val(p.customer_mobile || '');
        // ensure date format (YYYY-MM-DD) for date input
        $('#slot_date').val(p.slot_date || '');
        loadSlotTimes(p.slot_time || '');
        $('#slot_time').val(p.slot_time || '');
        $('#direct_map_link').val(p.direct_map_link || '');
        $('a.drive-through').remove();
        if(p.direct_map_link != ''){
          $('#direct_map_link').closest('.form-group').append('<a target="_blank" href="'+p.direct_map_link+'" class="drive-through"><i class="fas fa-map-marker-alt"></i> Drive Through</a>');
        }
        $('#pickup_remark').val(p.pickup_remark || '');
        $('#pickup_description').val(p.pickup_description || '');
        $('#shipping_id').data('latitude',p.latitude || '');
        $('#shipping_id').data('longitude',p.longitude || '');

        $('#shipping_id').data('loc_building',p.map_loc_building || '');  
        $('#shipping_id').data('loc_apartment',p.map_loc_apartment || '');
        $('#shipping_id').data('loc_name',p.map_loc_name || '');  
        $('#shipping_id').data('loc_other',p.shipping_other_info || '');

        var $cust_name = $('#customer_name').val(p.customer_name || '');

        var $dropdown = $('#shipping_address_dropdown');
        $dropdown.empty();
        $dropdown.append('<option value="">Select Shipping Address</option>');

        if(Array.isArray(p.shipping_addresses) && p.shipping_addresses.length > 0) {
          p.shipping_addresses.forEach(function(addr) {
            var selected = (addr.id == p.shipping_id) ? 'selected' : '';
            $dropdown.append(
              `<option value="${addr.id}" ${selected}>
                ${addr.shipping_address} | ${addr.shipping_name || ''} | ${addr.shipping_mobile || ''}
              </option>`
            );
          });
        }

        // Initialize or re-initialize Select2 with custom templates
       $dropdown.select2({
          width: '100%',
          dropdownParent: $('#customerDetailsModal'),
          templateResult: function(data) {
            if (!data.id) return data.text;
            const $option = $(data.element);
            let [address, name = '', mobile = ''] = $option.text().split('|').map(s => s.trim());
            return $(`
              <div>
                <div style="font-size:1rem; font-weight:500; color:#000000;">${address}</div>
                <div style="font-size:0.8rem; color:#000;">${name}${mobile ? ' | ' + mobile : ''}</div>
              </div>
            `); // Shows all fields in the dropdown
          },
          templateSelection: function(data) {
            if (!data.id) return data.text;
            const $option = $(data.element);
            let [address] = $option.text().split('|').map(s => s.trim());
            return `<span style="font-size:1rem;">${address}</span>`; // Only show address when selected
          },
          escapeMarkup: function(markup) { return markup; }
        });


        var $areaDropdown = $('#shipping_area_dropdown');
        $areaDropdown.empty();
        $areaDropdown.append('<option value="">Select Shipping Area</option>');

        if (Array.isArray(p.shipping_area) && p.shipping_area.length > 0) {
            p.shipping_area.forEach(function(area) {
                var selected = (area.id == p.shipping_area_id) ? 'selected' : '';
                $areaDropdown.append(`<option value="${area.id}" ${selected}>${area.area_name}</option>`);
            });
        }

        $('#customerDetailsModal').modal('show');
      } else {
        $.confirm({
            title: false,
            content: 'Pickup details not found',
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
    error: function(xhr) {
      console.error(xhr); 
      $.confirm({
        title: false,
        content: 'Error Fetching Pickup Details',
        type: 'orange',
        buttons: {
          ok: {
            text: 'OK',
            btnClass: 'btn-warning'
          }
        }
      });
    }
  });
});


$('#customerDetailsForm').on('submit', function(e) {
  e.preventDefault();
  var frm = $(this);
  var postData = frm.serialize() + '&client_identifier=' + encodeURIComponent(client_identifier);
  var pickupIdVal = $('#shipping_address_dropdown').val();
  postData += '&pickup_id=' + encodeURIComponent(pickupIdVal);
  var shippingAreaIdVal = $('#shipping_area_dropdown').val();
  postData += '&shipping_area_id=' + encodeURIComponent(shippingAreaIdVal);
  $.confirm({
    title: false,
    content: 'Do you want to update the details or convert to pickup?',
    type: 'blue',
    closeIcon: true,
    buttons: {
      update: {
        text: 'Update Details',
        btnClass: 'btn-primary btn-block btn-action-fullwidth',
        action: function() {
          $.confirm({
            title: false,
            content: 'Are you sure you want to update the details?',
            type: 'blue',
            buttons: {
              yes: {
                text: 'Yes',
                btnClass: 'btn-success',
                action: function() {
                  $.ajax({
                    url: base_url + '/Packing_api/updatePickup',
                    type: 'POST',
                    data: postData,
                    dataType: 'JSON',
                    success: function(res) {
                      if(res && res.success) {
                        $('#customerDetailsModal').modal('hide');
                        LoadPendingPickups('');
                      } else {
                        $.confirm({
                          title: false,
                          content: 'Error While Updating',
                          type: 'red',
                          buttons: {
                            ok: {
                              text: 'OK',
                              btnClass: 'btn-red btn-wide'
                            }
                          }
                        });
                      }
                    },
                    error: function(xhr) {
                      console.error(xhr);
                      $.alert('Error saving changes');
                    }
                  });
                }
              },
              no: {
                text: 'No',
                btnClass: 'btn-secondary',
                action: function() {
                }
              }
            }
          });
        }
      },
      convert: {
        text: 'Convert To Pickup',
        btnClass: 'btn-success btn-block btn-action-fullwidth',
        action: function(){
          updateToRequest(postData);
        }
      },
      cancel:{
        text: 'Cancel Pickup',
        btnClass: 'btn-red btn-block btn-action-fullwidth',
        action: function(){
          // updateToRequest(postData);
          CancelPickup(postData);
        }
      }
    }
  });
});



function updateToRequest(postData) {
  $.confirm({
    title: false,
    content: 'Are you sure you want to convert this request to a pickup?',
    type: 'blue',
    buttons: {
      yes: {
        text: 'Yes',
        btnClass: 'btn-success',
        action: function() {
          $.ajax({
            url: base_url + '/Packing_api/RequestToPickup',
            type: 'POST',
            data: postData,
            dataType: 'JSON',
            success: function(res) {
              if(res && res.success) {
                $('#customerDetailsModal').modal('hide');
                LoadPendingPickups('');
              } else {
                $.confirm({
                  title: false,
                  content: 'Error While Updating',
                  type: 'red',
                  buttons: {
                    ok: {
                      text: 'OK',
                      btnClass: 'btn-red'
                    }
                  }
                });
              }
            },
            error: function(xhr) {
              console.error(xhr);
              alert('Error saving changes');
            }
          });
        }
      },
      no: {
        text: 'No',
        btnClass: 'btn-secondary',
        action: function() {
        }
      }
    }
  });
} 

function CancelPickup(postData) {
  function getQueryParamValue(qs, key) {
    if (!qs || typeof qs !== 'string') return '';
    var pairs = qs.split('&');
    for (var i = 0; i < pairs.length; i++) {
      if (!pairs[i]) continue;
      var parts = pairs[i].split('=');
      var k = decodeURIComponent(parts[0]);
      if (k === key) {
        var v = parts.slice(1).join('=');
        return typeof v === 'undefined' ? '' : decodeURIComponent(v.replace(/\+/g, ' '));
      }
    }
    return '';
  }
  function setOrAppendQueryParam(qs, key, value) {
    var enc = encodeURIComponent(value || '');
    if (!qs) return key + '=' + enc;
    var parts = qs.split('&');
    var found = false;
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (!p) continue;
      var idx = p.indexOf('=');
      var k = idx === -1 ? p : p.substring(0, idx);
      if (k === key) {
        parts[i] = key + '=' + enc;
        found = true;
        break;
      }
    }
    if (!found) parts.push(key + '=' + enc);
    return parts.join('&');
  }

  $.confirm({
    title: false,
    content: '<form id="cancelPickupForm">'
           + '<p>Are you sure you want to cancel this pickup?</p>'
           + '<textarea id="cancelMessage" class="form-control" placeholder="Enter cancel message"></textarea>'
           + '</form>',
    type: 'blue',
    buttons: {
      yes: {
        text: 'Yes',
        btnClass: 'btn-success',
        action: function() {
          var cancelMessage = this.$content.find('#cancelMessage').val() || '';
          cancelMessage = cancelMessage.trim();

          var dataToSend;

          if (typeof postData === 'string') {
            var existing = getQueryParamValue(postData, 'pickup_remark');
            if (cancelMessage.length > 0) {
              dataToSend = setOrAppendQueryParam(postData, 'pickup_remark', cancelMessage);
            } else {
              dataToSend = postData;
            }
          }
          else if ($.isPlainObject(postData)) {
            if (cancelMessage.length > 0) {
              postData.pickup_remark = cancelMessage;
            } else {
            }
            dataToSend = postData;
          }
          else {
            dataToSend = {};
            if (postData && postData.id) dataToSend.id = postData.id;
            if (cancelMessage.length > 0) dataToSend.pickup_remark = cancelMessage;
          }
          $.ajax({
            url: base_url + '/Packing_api/cancelPickup',
            type: 'POST',
            data: dataToSend,
            dataType: 'JSON',
            success: function(res) {
              if (res && res.success) {
                $('#customerDetailsModal').modal('hide');
                LoadPendingPickups('');
              } else {
                $.confirm({
                  title: false,
                  content: (res && res.message) ? res.message : 'Error While Updating',
                  type: 'red',
                  buttons: {
                    ok: { text: 'OK', btnClass: 'btn-red' }
                  }
                });
              }
            },
            error: function(xhr) {
              console.error(xhr);
              alert('Error saving changes');
            }
          });
        }
      },
      no: {
        text: 'No',
        btnClass: 'btn-secondary'
      }
    },
    onOpenBefore: function () {
      setTimeout(() => {
        this.$content.find('#cancelMessage').focus();
      }, 100);
    }
  });
}



$(document).ready(function() {
  $('#pickupFilterBtn').on('click', function() {
    let searchValue = $('#pickupSearchInput').val().trim();
    LoadPendingPickups(searchValue);
  });
  $('#pickupSearchInput').on('keypress', function(e) {
    if (e.which === 13) {
      $('#pickupFilterBtn').click();
    }
  });
});

function loadSlotTimes(selectedSlotId) {
  $.ajax({
    url: base_url + "/Packing_api/get_slot_times",
    type: "POST",
    data: { client_identifier: client_identifier },
    dataType: "JSON",
    success: function(slots) {
      var $slotSelect = $("#slot_time");
      $slotSelect.empty();
      $slotSelect.append('<option value="">Select a time slot</option>');
      $.each(slots, function(i, slot) {
        var isSelected = slot.id == selectedSlotId ? "selected" : "";
        $slotSelect.append('<option value="' + slot.id + '" ' + isSelected + '>' + slot.delivery_slot + '</option>');
      });
    }
  });
}

function loadPickupCounters() {
  $.ajax({
    url: base_url + "/Packing_api/fetchPendingPickupCounts",
    type: "POST",
    data: {
      user_id: user_id,
      branch_id: branch_id,
      client_identifier: client_identifier
    },
    dataType: "json",
    success: function(response) {
      $('#Pickup_counter').text(response.pickup_count || 0);
      $('#PickupRequest_counter').text(response.pickup_request_count || 0);
    },
    error: function() {
      $('#Pickup_counter').text('0');
      $('#PickupRequest_counter').text('0');
    }
  });
}

$(document).ready(function() {
  loadPickupCounters();
});

$('#Pickup_request').on('click', function() {
    $('#today_date').focus();
    $('#today_date')[0].click();
});

$(document).on('click', '.save_address_pickup', function () {
    $(".location_txt,.apartment_txt,.name_txt").removeClass('invalid');
    let location_txt = $(".location_txt").val();
    let apartment_txt = $(".apartment_txt").val();
    let name_txt = $(".name_txt").val();
    let addr_spec_txt = $(".addr_spec_txt").val();
    let validForm = true;
    if (location_txt == ""){ $(".location_txt").addClass('invalid'); validForm = false;}
    if (apartment_txt == ""){ $(".apartment_txt").addClass('invalid'); validForm = false;}
    if (name_txt == ""){ $(".name_txt").addClass('invalid'); validForm = false;}
    let pm_id = '';
    // if (!$(".location_txt").hasClass('invalid') && !$(".apartment_txt").hasClass('invalid') && !$(".name_txt").hasClass('invalid')) {
        $('#shipping_id').data('loc_building',location_txt);  
        $('#shipping_id').data('loc_apartment',apartment_txt);
        $('#shipping_id').data('loc_name',name_txt);  
        $('#shipping_id').data('loc_other',addr_spec_txt);
        // $("#customerDetailsModal").modal('hide');
        // $("#add_address").modal('hide');
        
        // processDelivery();
        console.log('aaaaaaaaaaaaaaaaaaaa')
        let pickupId = $('#pickup_id').val();
        let lat = $('#shipping_id').data('latitude');  
        let lng = $('#shipping_id').data('longitude');
        if(validForm && pickupId > 0){
          loadAjax();
          $.ajax({
              url: base_url+'/packing_api/updatePickupLocation',
              method: 'POST',
              data: {'client_identifier': client_identifier,'pickupId':pickupId,'lat':lat, 'lng':lng,'loc_building':location_txt,'loc_apartment':apartment_txt,'loc_name':name_txt,'loc_other':addr_spec_txt},
              dataType : "JSON",
              success: function(res) {
                removeAjaxLoad();
                if(res && res.success) {
                  // showToaster(200, 'Pickup Location Updated!');
                  $('.address_popup_close,.google_map_close').trigger('click')
                  // LoadPendingPickups('');
                } else {
                  $.alert('Error saving changes');
                }
              },
              error: function(xhr) {
                removeAjaxLoad();
                console.error(xhr);
                $.alert('Error saving changes');
              }
            });
        }
    // }
}); 
$("body").on('change','input#inlineCheckbox2',function(){
  let send_whatsapp = $(this).is(":checked")?1:0;
  localStorage.setItem('send_whatsapp_on_deliver',send_whatsapp);
})
function whatsapp_share_ajax(secret,account,text,mobile,api)
{
  let whtsapcurrentTime = new Date().getTime(); // current time in milliseconds
  let lastmsgTime = localStorage.getItem("whatsapp_req_time");
  if (lastmsgTime) {
      let diffInSeconds = (whtsapcurrentTime - lastmsgTime) / 1000;
      if (diffInSeconds <= 60) {
          api = 'https://manage.aipsoft.com/external_push/push_to_whatsapp_queue';
      }
  }
  localStorage.setItem("whatsapp_req_time", whtsapcurrentTime);
  $.ajax({
      url: api,
      method: 'POST',
      data: {'secret': secret, 'account': account, 'recipient': mobile, 'type': 'text', 'message': text, 'priority': 0},
      dataType:'html',
      dataType : "JSON",
      success: function(responseArr) 
      {
        //console.log('whatsapp-check')
        //console.log(responseArr);
        if(responseArr.status == 200 || responseArr.status == 500)
          if(responseArr.status == 500){
            console.log("WhatsApp Message Shared to the server, Confirm with your mobile !")
            // showToaster(200, 'WhatsApp Message Shared to the server, Confirm with your mobile !');
          }
          else{
            console.log(responseArr.message)
            // showToaster(200, responseArr.message);
          }
        else{
          console.log(responseArr.message)
          // showToaster(400, responseArr.message);
        }
        
      },
      error:function(request, status, error)
      {
        console.log(error)
        // showToaster(400, error);
      }
    });
  return true;
}

//--------- swipe page refresh -------------------------------------------------
function modalIsOpen() {
  return document.body.classList.contains('modal-open');
}
(function(){
      // -------------- pull refresh --------------------------------------
      var ptr = document.getElementById('pullToRefresh');
      var startY = 0, dist = 0, pulling = false;
      var threshold = 70;
      var maxPull = 140;
      var scroller = document.scrollingElement || document.documentElement;
      function setHeight(h){ ptr.style.height = h + 'px'; }
      
      //---------------- swipe back ---------------------------------------
      var startX         = 0, swipeStartY = 0;
      var EDGE_THRESHOLD = 30;   // px from left edge to begin swipe
      var SWIPE_MIN_X    = 80;   // minimum horizontal distance to trigger
      var SWIPE_MAX_Y    = 80;   // maximum vertical drift allowed
      var isTracking     = false;


      window.addEventListener('touchstart', function(e){
        var touch = e.touches[0];

        // Swipe-back: only track touches starting from left edge
        if (touch.clientX <= EDGE_THRESHOLD) {
          startX      = touch.clientX;
          swipeStartY = touch.clientY;
          isTracking  = true;
        } else {
          isTracking = false;
        }

        // Pull-to-refresh: skip if modal open or not at top of page
        if (modalIsOpen()) {
          pulling = false;
          return;   
        }
        if ((scroller && scroller.scrollTop <= 0) || window.pageYOffset === 0) {
          startY = e.touches[0].clientY;
          pulling = true;
          ptr.style.transition = 'none';
        } else {
          pulling = false;
        }
      }, {passive: true});

      window.addEventListener('touchmove', function(e){
        // Swipe-back: block vertical scroll while user is swiping right from edge
        if (isTracking) {
          var dx = e.touches[0].clientX - startX;
          var dy = Math.abs(e.touches[0].clientY - swipeStartY);
          if (dx > 10 && dy < SWIPE_MAX_Y) {
            e.preventDefault();
            return; // don't let pull-to-refresh also fire during a swipe-back
          }
        }

        // ---- Pull-to-refresh-------
        if (modalIsOpen()) return;  
        if (!pulling) return;
        var y = e.touches[0].clientY;
        dist = Math.max(0, y - startY);
        if (dist > 0) {
          if (dist > 5) e.preventDefault();
          var h = Math.min(dist, maxPull);
          setHeight(h);
          if (dist > threshold)
            ptr.classList.add('ready');
          else
            ptr.classList.remove('ready');
        }
      }, {passive: false});

      window.addEventListener('touchend', function(){
        // -------- Swipe-back check --------------------
        if (isTracking) {
          var touch = e.changedTouches[0];
          var dx    = touch.clientX - startX;
          var dy    = Math.abs(touch.clientY - swipeStartY);
          isTracking = false;
          if (dx >= SWIPE_MIN_X && dy < SWIPE_MAX_Y) {
            window.history.back();
            return; // don't trigger pull-to-refresh on the same gesture
          }
        }

        //-------  Pull-to-refresh --------------------
        if (modalIsOpen()) return;  
        if (!pulling) return;
        ptr.style.transition = 'height 300ms ease';
        if (dist > threshold) {
          ptr.classList.remove('ready');
          ptr.classList.add('refreshing');
          setHeight(50);
          setTimeout(function(){ location.reload(); }, 300);
        } else {
          setHeight(0);
        }
        pulling = false;
        dist = 0;
      });
    })();

 