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
let order_images;
checkRedirect();
clock();  
window.onload = setInterval(clock,1000);
function clock()
{
  var d = new Date();
  var date = d.getDate();
  var month = d.getMonth();
  var montharr =["Jan","Feb","Mar","April","May","June","July","Aug","Sep","Oct","Nov","Dec"];
  month=montharr[month];
  var year = d.getFullYear();
  var day = d.getDay();
  var dayarr =["Sun","Mon","Tues","Wed","Thurs","Fri","Sat"];
  day=dayarr[day];
  var hour =d.getHours();
  var min = d.getMinutes();
  var sec = d.getSeconds();
  document.getElementById("header_date").innerHTML="<h5>"+(hour<10?'0'+hour:hour)+":"+(min<10?'0'+min:min)+":"+(sec<10?'0'+sec:sec)+" <span>"+day+", "+date+" "+month+" "+year+"</span></h5>";
  // document.getElementById("time").innerHTML=hour+":"+min+":"+sec;
}
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
$('body').on('click','.nav_header .logout',function(){
  $('.power_actions li:first-child').trigger('click')
  return false;
})
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
          url      : base_url+"/packing_api/proceedPowerAction",
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
  window.location = "../login.html";
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
    window.location.replace(`index.html`);
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
      if(page_name=='split.html')
        LoadOrderDetails();
      if(page_name=='delivery_preview.html')
        LoadDeliveredOrderDetails();
      if(page_name=='packing.html')
        LoadPackingDetails();
      if(page_name=='customer-orders.html')
        LoadCustomerOrderDetails();
      if(page_name=='my-jobs.html')
        LoadMyJobs();
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
function LoadGeneralSettings(reload=true)
{
  if(reload)
    loadAjax();
  $.ajax({
        url: base_url+'/packing_api/getPackingData',
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
                $('.profile_logged').text('Counter Opened @ '+login_date+' '+login_time);
                $('.profile_branch').text(response.branch_city);

                //---------------INITIAL SETUPS STARTS --------------------------------------//
                time_zone      = response.time_zone;
                page_title     = response.page_title;
                hostname       = response.domain;
                let my_jobs    = response.my_jobs['jobs'];
                let tot_jobs   = Number(response.my_jobs['total_jobs']);
                if(tot_jobs > 0)
                  $('.my-jobs').show()
                else
                  $('.my-jobs').hide()
                $('.my-jobs span').text(tot_jobs);
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
                $('.pref_char').val(order_prefix);
                // $('#order_no').val();
                // $('#order_no').val();
                let userDependencies = response.userDependencies;
                // console.log(userDependencies)
                let def_dependency = localStorage.getItem('default_dependency');
                let dep_options = '<option value="0">Choose an option</option>';
                let selected_opt = '';
                $.each(userDependencies,function(index,each_dep){
                  // console.log(def_dependency,each_dep.id)
                    selected_opt = each_dep.id == def_dependency ? 'selected' : '';
                    dep_options += '<option value="'+each_dep.id+'" '+selected_opt+'>'+each_dep.name+'</option>';
                })
                $('.user_dependencies').html(dep_options);
                removeAjaxLoad();
                setTimeout(function(){$('.main_entry_fld').trigger('focus')},100);
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
function LoadOrderDetails(reload=true)
{
  loadAjax();
  let split_qty = localStorage.getItem("split_qty");
  if(split_qty == "1")
  {
    $('.split_dbl_btn').addClass('disabled_icon');
    $('.split_qty input[type="checkbox"]').prop('checked',true);
  }
  else
  {
    $('.split_dbl_btn').removeClass('disabled_icon');
    $('.split_qty input[type="checkbox"]').prop('checked',false);
  }
  hostname = window.localStorage.getItem('hostname');
  page_title = window.localStorage.getItem('page_title');
  time_zone = window.localStorage.getItem('time_zone');
  $('.inp_field').val('');
  let order_id = window.localStorage.getItem('current_order_id');
  if(order_id==undefined || order_id=='')
    window.location.replace(`landing.html`);
  let origin_from = window.localStorage.getItem('origin_from');
  console.log('origin_from',origin_from)
  if(origin_from == 'customer_orders')
  {
    $('.mobile_product_list').css('height','calc(100vh - 440px)')
  }
  else
  {
    $('.scan_cloth_footerdiv').hide()
  }
  $.ajax({
        url: base_url+'/packing_api/getOrderDetails',
        method: 'POST',
        data: {'client_identifier': client_identifier,'branch_id':branch_id,'user_id':user_id,'order_id':order_id,'time_zone':time_zone},
        dataType : "JSON",
        success: function(data) 
        {
          // removeAjaxLoad();
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
                $('.profile_logged').text('Counter Opened @ '+login_date+' '+login_time);
                $('.profile_branch').text(response.branch_city);
                
                //---------------INITIAL SETUPS STARTS --------------------------------------//
                currency_short    = response.currency_short;
                client_identifier = response.client_identifier;
                let depots        = response.depots;
                let branches      = '';
                $.each(depots,function(index,each_depot){
                    branches += '<option value="'+each_depot.id+'">'+each_depot.city+'</option>';
                })
                $('.order_branch').html(branches);
                let all_salesman  = response.all_salesman;
                let salesmans     = '';
                $.each(all_salesman,function(index,each_salesman){
                  salesmans     += '<option value="'+each_salesman.user_id+'">'+each_salesman.acc_name+'</option>';
                })
                $('.salesman').html(salesmans);
                let order_data    = response.order_details;
                order_images  = response.order_images?response.order_images:{};
                if(order_data.length>0)
                {
                  $('.order_no').val(order_data[0].order_no);
                  $('.order_no').data('order_id',order_data[0].order_id);
                  $('.order_branch').val(order_data[0].branch_id);
                  $('.order_date').val(order_data[0].billing_date);
                  // var date = new Date(order_data[0].delivery_date);
                  let delivery_date = moment(order_data[0].delivery_date).format('DD-MM-YYYY');
                  $('.del_date').val(delivery_date);
                  $(".del_date").data('selected_date',delivery_date)
                  $('.del_time').val(order_data[0].delivery_time);
                  $('.salesman').val(order_data[0].done_by);
                  $('.next_packing_no').text(response.next_packing_no);
                  let cust_details = order_data[0].cust_name+', '+order_data[0].cust_mobile;
                  cust_details += order_data[0].cust_address1!=''?', '+order_data[0].cust_address1:'';
                  $('.cust_data').text(cust_details);
                  $('.cust_data').data('cust_id',order_data[0].customer_id);
                  
                  $('.packing_date').datepicker('setDate', response.pack_date);
                  // $('.del_date').datepicker('setDate', order_data[0].delivery_date);
                  $('.packing_time').timepicker('setTime', response.pack_time);
                  // $('.del_time').timepicker('setTime', order_data[0].delivery_time);
                  // $('.ord_item_total').text('0.00 '+currency_short);
                  // $('.packed_item_total').text('0.00 '+currency_short);

                  let unit_tax= 0;
                  let rem_qty = 0;
                  let sl_no=0;
                  let item;
                  let tot_qty=0;
                  let prod_name;
                  $.each(order_data,function(index,each_data){
                      prod_name = (each_data.product_name1_short!='' && each_data.product_name1_short!=null)?each_data.product_name1_short:each_data.product_name1;
                      rem_qty   = Number(each_data.qty)-Number(each_data.delivered_qty);
                      if(rem_qty>0)
                      {
                          tot_qty += rem_qty;
                          item = `<li class="split_item split_item_tr split_to split_item_${each_data.id}" data-db_id="${each_data.id}" data-unit_name="${each_data.unitname_short}" data-prod_name="${prod_name}" 
                          data-prod_id="${each_data.product_id}" data-prod_barcode="${each_data.barcode}">
                                        <table class="pro_table">
                                          <tr>
                                            <td class="ord_sl_no" style="width:10%">${++sl_no}</td>
                                            <td class="ord_prod_name" style="width:70%">${prod_name} - ${each_data.unitname_short}</td>
                                            <td class="ord_qty" style="width:20%">${rem_qty}</td>
                                          </tr>
                                        </table>
                                    </li>`;
                          $('.order_items').append(item);
                      }
                                //<td>25.00</td>
                  })
                  $('.tot_ord_item_qty').text(tot_qty);

                  if(order_images.length>0)
                  {
                      let slider_html = `<div class="order_image_wrap">Order Images(${order_images.length}) <a href="javascript:"><i class="fas fa-chevron-up"></i></a></div><div class="slider_comments_container"><div class="swiper-container"><div class="swiper-wrapper">`;
                      $.each(order_images,function(index,each_image){
                        slider_html += `<div class="swiper-slide">
                                          <img src="${each_image.file_name}" alt="Sample Image ${++index}" class="swiper-image">
                                          <div class="slide-caption">${each_image.file_title}</div>
                                        </div>`;
                      })
                      slider_html += `</div>
                                  <div class="swiper-pagination"></div>
                              </div></div>`;
                      $('.order_images_container').html(slider_html);      
                      console.log(slider_html)  
                      var swiper = new Swiper('.swiper-container', {
                          slidesPerView: 1,
                          spaceBetween: 10,
                          pagination: {
                              el: '.swiper-pagination',
                              clickable: true,
                          },
                          autoplay: {
                              delay: 3000,
                              disableOnInteraction: false,
                          },
                      });
                      $('.mobile_product_list').css('height','calc(100vh - 360px)')
                  }
                  let automated_scan = window.localStorage.getItem('automated_scan');
                  let cloth_barcode = window.localStorage.getItem('cloth_barcode');
                  if(cloth_barcode!=undefined && cloth_barcode!='' && automated_scan == 1)
                  {
                     scanClothBarcode(cloth_barcode);
                     window.localStorage.setItem('automated_scan','0');
                  }
                  if(origin_from == 'customer_orders')
                  {
                    setTimeout(function(){ $('.cloth_scan_input').focus();},100);
                  }
                }
                else
                {
                  window.localStorage.setItem('automated_scan','0');
                  loadErrorPopup('Already Packed','The Order you are trying to open is already packed completely.')
                }
              }
              else
              {
                window.localStorage.setItem('automated_scan','0');
                loadErrorPopup('Software Error','Data not loaded, Contact Support team.','1')
              }
          }
          else
          {
            // $.alert(data.message)
            window.localStorage.setItem('automated_scan','0');
            loadErrorPopup('Loading Error',data.message,'1')
          }
          removeAjaxLoad();
        },
        error:function(request, status, error)
        {
          window.localStorage.setItem('automated_scan','0');
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
$('body').on('click','.order_image_wrap',function(){
  if($(this).hasClass('opened')){
    $(this).removeClass('opened');
    $(this).find('a').html('<i class="fas fa-chevron-up"></i>');
    $('.slider_comments_container').slideUp(100)
    $('.mobile_product_list').css('height','calc(100vh - 360px)')
  }else{
    $(this).addClass('opened');
    $(this).find('a').html('<i class="fas fa-chevron-down"></i>');
    $('.mobile_product_list').css('height','calc(100vh - 665px)')
    $('.slider_comments_container').slideDown(300)
  }
})
$('body').on('click', '.swiper-image', function() {
        var clickedIndex = $(this).closest('.swiper-slide').index();  // Get the index of the clicked image
        var modalSlidesHtml = '';

        // Generate the HTML for the modal slider (same as the main slider)
        $.each(order_images, function(index, each_image){
            modalSlidesHtml += `<div class="swiper-slide"><img src="${each_image.file_name}" alt="Sample Image ${index + 1}" class="modal-image"><div class="slide-caption">${each_image.file_title}</div></div>`;
        });

        // Insert the slides HTML into the modal swiper container
        $('.modal-swiper .swiper-wrapper').html(modalSlidesHtml);

        // Show the modal
        $('#imageModal').css('display', 'block');

        // Initialize Swiper in the modal
        var modalSwiper = new Swiper('.modal-swiper', {
            initialSlide: clickedIndex, // Set the clicked image as the active slide
            slidesPerView: 1,
            spaceBetween: 10,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            autoplay: false,
        });
    });

    // Close the modal when the close button is clicked
    $('.close-modal').on('click', function() {
        $('#imageModal').css('display', 'none');  // Hide the modal
    });

    // Close the modal when clicking outside of the image
    $(window).on('click', function(event) {
        if (event.target == document.getElementById('imageModal')) {
            $('#imageModal').css('display', 'none');  // Hide the modal
        }
    });
function LoadDeliveredOrderDetails(reload=true)
{
  loadAjax();
  hostname = window.localStorage.getItem('hostname');
  page_title = window.localStorage.getItem('page_title');
  time_zone = window.localStorage.getItem('time_zone');
  $('.inp_field').val('');
  let order_id = window.localStorage.getItem('current_order_id');
  let invoice_id = window.localStorage.getItem('current_invoice_id');
  if(order_id==undefined || order_id=='')
    window.location.replace(`landing.html`);
  $.ajax({
        url: base_url+'/packing_api/getDeliveredOrderDetails',
        method: 'POST',
        data: {'client_identifier': client_identifier,'branch_id':branch_id,'user_id':user_id,'order_id':order_id,'invoice_id':invoice_id,'time_zone':time_zone},
        dataType : "JSON",
        success: function(data) 
        {
          // removeAjaxLoad();
          $('.valid_input').val('');
          if(data.status==1)
          {
            let response = data.data;
              if(Object.keys(response).length > 0)
              {
                currency_short = response.currency_short;
                no_of_decimals = 2;
                $('.profile_avatar').attr('src',response.profile_path);
                $('.profile_name').text(response.acc_name1);
                $('.profile_type').text(response.user_type_name);
                $('.profile_logged').text('Counter Opened @ '+login_date+' '+login_time);
                $('.profile_branch').text(response.branch_city);
                
                //---------------INITIAL SETUPS STARTS --------------------------------------//
                currency_short    = response.currency_short;
                client_identifier = response.client_identifier;
                let order_data    = response.order_details;
                if(order_data.length>0)
                {
                  let inv_title = invoice_id > 0 ? 'TAX INVOICE' : 'JOB ORDER';
                  let del_date_label  = invoice_id > 0 ? 'Delivered On' : 'Expected Delivery';
                  let order_bill_date = invoice_id > 0 ? order_data[0].so_billing_date : order_data[0].bill_date;
                  let order_del_date  = order_data[0].del_date;
                  let deliver_preview = `<h1 class="align-center">${inv_title}<br>#${order_data[0].order_no}</h1>
                                        <table class="attributes" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                          <tbody>
                                             <tr>
                                                <td class="attributes_content">
                                                   <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                                      <tbody>
                                                          <tr>
                                                            <td class="attributes_item">
                                                               <span class="f-fallback">
                                                               <strong class="text_amount">Customer Name:</strong> <label class="number_to_arabic">${order_data[0].cust_name}</label></span>
                                                            </td>
                                                         </tr>
                                                         <tr>
                                                            <td class="attributes_item">
                                                               <span class="f-fallback">
                                                               <strong class="text_amount">Customer Mobile:</strong> <label class="number_to_arabic">${order_data[0].cust_mobile}</label></span>
                                                            </td>
                                                         </tr>
                                                         <tr>
                                                            <td class="attributes_item">
                                                               <span class="f-fallback">
                                                               <strong class="text_amount">Customer Info:</strong> <label class="number_to_arabic">${order_data[0].cust_address1 ? order_data[0].cust_address1 : '-'}</label></span>
                                                            </td>
                                                         </tr>
                                                         <tr>
                                                            <td class="attributes_item">
                                                               <span class="f-fallback">
                                                               <strong class="text_amount">Amount:</strong> <label class="number_to_arabic">${Number(order_data[0].grand_total).toFixed(no_of_decimals)}</label></span>
                                                            </td>
                                                         </tr>
                                                         <tr>
                                                            <td class="attributes_item">
                                                               <span class="f-fallback">
                                                               <strong class="text_order_date">Order Date:</strong> <label class="number_to_arabic">${order_bill_date}</label>
                                                               </span>
                                                            </td>
                                                         </tr>
                                                         <tr>
                                                            <td class="attributes_item">
                                                               <span class="f-fallback">
                                                               <strong class="text_expected_delivery" style="color:red">${del_date_label}:</strong> <label class="number_to_arabic" style="color:red">${order_del_date}</label>
                                                               </span>
                                                            </td>
                                                         </tr>
                                                      </tbody>
                                                   </table>
                                                </td>
                                             </tr>
                                          </tbody>
                                       </table>
                                       <table width="100%" class="purchase_content" cellpadding="0" cellspacing="0">
                                          <tbody>
                                             <tr>
                                                <th class="purchase_heading" align="left">
                                                   <p class="f-fallback text_sno">S#</p>
                                                </th>
                                                <th class="purchase_heading" align="left">
                                                   <p class="f-fallback text_description">Description</p>
                                                </th>
                                                <th class="purchase_heading pull_right">
                                                   <p class="f-fallback text_qty">Qty</p>
                                                </th>
                                                <th class="purchase_heading pull_right">
                                                   <p class="f-fallback text_rate">Rate</p>
                                                </th>
                                                <th class="purchase_heading pull_right">
                                                   <p class="f-fallback text_amount">Amount</p>
                                                </th>
                                             </tr>`;
                  
                  let unit_tax= 0;
                  let rem_qty = 0;
                  let sl_no=0;
                  let item;
                  let tot_qty=0;
                  let prod_name;
                  let unit_price;
                  let amount;
                  $.each(order_data,function(index,each_data){
                      prod_name = (each_data.product_name1_short!='' && each_data.product_name1_short!=null)?each_data.product_name1_short:each_data.product_name1;
                      rem_qty   = Number(each_data.qty);
                      unit_price   = Number(each_data.unit_price).toFixed(2);
                      amount   = Number(each_data.sub_total).toFixed(2);
                      if(rem_qty>0)
                      {
                          tot_qty += rem_qty;
                          deliver_preview += `<tr>
                                      <td width="7%" class="purchase_item"><span class="f-fallback number_to_arabic">${++sl_no}</span></td>
                                      <td width="35%" class="purchase_item"><span class="f-fallback">${prod_name} - ${each_data.unitname_short}</span></td>
                                      <td class="align-right" width="15%"><span class="f-fallback number_to_arabic">${rem_qty}</span></td>
                                      <td class="align-right" width="20%"><span class="f-fallback number_to_arabic">${unit_price}</span></td>
                                      <td class="align-right" width="20%"><span class="f-fallback number_to_arabic">${amount}</span></td>
                                   </tr>`;
                      }
                                //<td>25.00</td>
                  })
                  deliver_preview += `<tr>
                                                <td colspan="3" class="" valign="middle">
                                                   <p class="f-fallback purchase_total purchase_total--label text_vatable_sales">VATable Sales</p>
                                                </td>
                                                <td colspan="2" class="" valign="middle">
                                                   <p class="f-fallback purchase_total number_to_arabic">${Number(order_data[0].total_amount).toFixed(no_of_decimals)}</p>
                                                </td>
                                             </tr>
                                             <tr>
                                                <td colspan="3" class="" valign="middle">
                                                   <p class="f-fallback purchase_total purchase_total--label text_vat_amount">VAT Amount</p>
                                                </td>
                                                <td colspan="2" class="" valign="middle">
                                                   <p class="f-fallback purchase_total number_to_arabic">${Number(order_data[0].tax_amount).toFixed(no_of_decimals)}</p>
                                                </td>
                                             </tr>
                                             <tr>
                                                <td colspan="3" class="" valign="middle">
                                                   <p class="f-fallback purchase_total purchase_total--label text_net_amount">Net Amount</p>
                                                </td>
                                                <td colspan="2" class="" valign="middle">
                                                   <p class="f-fallback purchase_total number_to_arabic">${Number(order_data[0].grand_total).toFixed(no_of_decimals)}</p>
                                                </td>
                                             </tr>
                                          </tbody>
                                       </table>
                                       <input type="hidden" id="acc_username" value="${response.acc_name1}" >`;
                  $('.deliver_preview').html(deliver_preview);
                }
                else
                {
                  window.localStorage.setItem('automated_scan','0');
                  loadErrorPopup('Already Packed','The Order you are trying to open is already packed completely.')
                }
              }
              else
              {
                window.localStorage.setItem('automated_scan','0');
                loadErrorPopup('Software Error','Data not loaded, Contact Support team.','1')
              }
          }
          else
          {
            // $.alert(data.message)
            window.localStorage.setItem('automated_scan','0');
            loadErrorPopup('Loading Error',data.message,'1')
          }
          removeAjaxLoad();
        },
        error:function(request, status, error)
        {
          window.localStorage.setItem('automated_scan','0');
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
function LoadPackingDetails(reload=true)
{
  loadAjax();
  hostname = window.localStorage.getItem('hostname');
  page_title = window.localStorage.getItem('page_title');
  time_zone = window.localStorage.getItem('time_zone');
  $('.inp_field').val('');
  let packing_id = window.localStorage.getItem('current_packing_id');
  if(packing_id==undefined || packing_id=='')
    window.location.replace(`landing.html`);
  $.ajax({
        url: base_url+'/packing_api/getPackingDetails',
        method: 'POST',
        data: {'client_identifier': client_identifier,'branch_id':branch_id,'user_id':user_id,'packing_id':packing_id,'time_zone':time_zone},
        dataType : "JSON",
        success: function(data) 
        {
          // removeAjaxLoad();
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
                $('.profile_logged').text('Counter Opened @ '+login_date+' '+login_time);
                $('.profile_branch').text(response.branch_city);
                
                //---------------INITIAL SETUPS STARTS --------------------------------------//
                currency_short    = response.currency_short;
                client_identifier = response.client_identifier;
                let order_data    = response.packing_details;
                if(order_data.length>0)
                {
                  $('.order_no').val(order_data[0].order_no);
                  $('.order_branch').val(order_data[0].branch_name);
                  $('.order_date').val(order_data[0].billing_date);
                  // var date = new Date(order_data[0].delivery_date);
                  // let delivery_date = moment(order_data[0].delivery_date).format('DD-MM-YYYY');
                  $('.del_date').val(order_data[0].delivery_date);
                  $(".del_date").data('selected_date',order_data[0].delivery_date)
                  $('.del_time').val(order_data[0].delivery_time);
                  $('.salesman').val(order_data[0].salesman);
                  $('.next_packing_no').text(response.next_packing_no);
                  let cust_details = order_data[0].cust_name+', '+order_data[0].cust_mobile;
                  cust_details += order_data[0].cust_address1!=''?', '+order_data[0].cust_address1:'';
                  $('.cust_data').text(cust_details);
                  
                  $('.packing_date').val(response.pack_date);
                  // $('.del_date').datepicker('setDate', order_data[0].delivery_date);
                  $('.packing_time').val(response.pack_time);
                  // $('.del_time').timepicker('setTime', order_data[0].delivery_time);
                  // $('.ord_item_total').text('0.00 '+currency_short);
                  // $('.packed_item_total').text('0.00 '+currency_short);

                  let unit_tax= 0;
                  let rem_qty = 0;
                  let sl_no=0;
                  let item;
                  let tot_qty=0;
                  let prod_name;
                  $.each(order_data,function(index,each_data){
                      prod_name = (each_data.product_name1_short!='' && each_data.product_name1_short!=null)?each_data.product_name1_short:each_data.product_name1;
                      rem_qty   = Number(each_data.qty);
                      if(rem_qty>0)
                      {
                          tot_qty += rem_qty;
                          item = `<li>
                                        <table class="pro_table">
                                          <tr>
                                            <td class="ord_sl_no" style="width:10%">${++sl_no}</td>
                                            <td class="ord_prod_name" style="width:70%">${prod_name} - ${each_data.unitname_short}</td>
                                            <td class="ord_qty" style="width:20%">${rem_qty}</td>
                                          </tr>
                                        </table>
                                    </li>`;
                          $('.packedd_items').append(item);
                      }
                                //<td>25.00</td>
                  })
                  $('.tot_packed_item_qty').text(tot_qty);
                }
                else
                {
                  loadErrorPopup('Already Packed','The Order you are trying to open is already packed completely.')
                }
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
          removeAjaxLoad();
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
function LoadCustomerOrderDetails(reload=true)
{
  loadAjax();
  hostname = window.localStorage.getItem('hostname');
  page_title = window.localStorage.getItem('page_title');
  time_zone = window.localStorage.getItem('time_zone');
  $('.inp_field').val('');
  let cloth_barcode = window.localStorage.getItem('cloth_barcode');
  if(cloth_barcode==undefined || cloth_barcode=='')
    window.location.replace(`landing.html`);
  $.ajax({
        url: base_url+'/packing_api/getCustomerOrderDetails',
        method: 'POST',
        data: {'client_identifier': client_identifier,'branch_id':branch_id,'user_id':user_id,'cloth_barcode':cloth_barcode,'time_zone':time_zone},
        dataType : "JSON",
        success: function(data) 
        {
          // removeAjaxLoad();
          $('.valid_input').val('');
          if(data.status)
          {
            let response = data.data;
            $('.pending_items').html('');
            if(Object.keys(response).length > 0)
            {
              $('.profile_avatar').attr('src',response.profile_path);
              $('.profile_name').text(response.acc_name1);
              $('.profile_type').text(response.user_type_name);
              $('.profile_logged').text('Counter Opened @ '+login_date+' '+login_time);
              $('.profile_branch').text(response.branch_city);
              
              // ---------------INITIAL SETUPS STARTS --------------------------------------//
              let customer_pending_orders    = response.cpo; // cpo => Customer Pending Orders 
              let no_pending_orders          = response.cpo_sc_count; //cpo_sc_count => Number of Customer Pending Orders With Scanned Items
              let no_completed_orders        = response.cco_count; // cco_count => Customer Completed Orders Count 
              $('.pending_order_cnt').text('('+customer_pending_orders.length+')');
              $('.completed_order_cnt').text('('+no_completed_orders+')');
              if(customer_pending_orders.length>0)
              {
                let cust_details = customer_pending_orders[0].customer_name+', '+customer_pending_orders[0].mobile;
                cust_details += customer_pending_orders[0].address1!=''?', '+customer_pending_orders[0].address1:'';
                $('.cust_data').text(cust_details);

                let packed_qty = 0; let sp_cls;
                $.each(customer_pending_orders,function(index,each_data){
                    packed_qty   = 0;
                    sp_cls = each_data.scanned_items_found ? 'item_found' : '';
                    sp_cls += each_data.pending_items == 0 || (each_data.scanned_items_found && each_data.scanned_pending_qty == 0) ? ' packed' : '';
                    // prod_name = (each_data.product_name1_short!='' && each_data.product_name1_short!=null)?each_data.product_name1_short:each_data.product_name1;
                    packed_qty   = Number(each_data.total_items) - Number(each_data.pending_items);
                    // if(rem_qty>0)
                    // {
                        item = `<li class="${sp_cls}" data-pending="${each_data.pending_items}" data-id="${each_data.id}" data-scanned_items_found="${each_data.scanned_items_found}" data-total_items="${each_data.total_items}" data-order_no="${each_data.order_no}">
                                      <table class="pro_table">
                                        <tr>
                                          <td class="ord_sl_no" style="width:25%">${each_data.order_no}</td>
                                          <td class="ord_prod_name" style="width:65%">${each_data.orderDate}</td>
                                          <td class="ord_qty" style="width:10%">${each_data.total_items}/${packed_qty}</td>
                                        </tr>
                                      </table>
                                  </li>`;
                        $('.pending_items').append(item);
                    // }
                              //<td>25.00</td>
                })

                let automated_scan = window.localStorage.getItem('automated_scan');
                if($('.pending_items li.item_found').not('.packed').length == 1 && automated_scan == 1)
                {
                  setTimeout(function(){
                    $('.pending_items li.item_found').not('.packed').trigger('click');
                    $('.next_block').trigger('click')
                  },100)
                }
                else
                  window.localStorage.setItem('automated_scan','0');
                // $('.tot_packed_item_qty').text(tot_qty);
              }
              else
              {
                loadErrorPopup('Already Packed','There is no Pending Order for the Customer.')
              }
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
          removeAjaxLoad();
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
function LoadMyJobs(reload=true)
{
  loadAjax();
  hostname = window.localStorage.getItem('hostname');
  page_title = window.localStorage.getItem('page_title');
  time_zone = window.localStorage.getItem('time_zone');
  let saved_job_filter = window.localStorage.getItem('saved_job_filter')?window.localStorage.getItem('saved_job_filter'):'';
  let saved_status_filter = window.localStorage.getItem('saved_status_filter')?window.localStorage.getItem('saved_status_filter'):'0';
  $('.inp_field').val('');
  
  $.ajax({
        url: base_url+'/packing_api/getMyJobsDetails',
        method: 'POST',
        data: {'client_identifier': client_identifier,'branch_id':branch_id,'user_id':user_id,'time_zone':time_zone,'job_filter':saved_job_filter, "status_filter":saved_status_filter},
        dataType : "JSON",
        success: function(data) 
        {
          // removeAjaxLoad();
          $('.valid_input').val('');
          if(data.status)
          {
            let response = data.data;
            $('.pending_items').html('');
            if(Object.keys(response).length > 0)
            {
              $('.profile_avatar').attr('src',response.profile_path);
              $('.profile_name').text(response.acc_name1);
              $('.profile_type').text(response.user_type_name);
              $('.profile_logged').text('Counter Opened @ '+login_date+' '+login_time);
              $('.profile_branch').text(response.branch_city);
              
              // ---------------INITIAL SETUPS STARTS --------------------------------------//
              let customer_pending_orders    = response.final_data; 
              let allDependencies            = response.allDependencies; 
              let userDependencies           = response.userDependencies; 
              console.log(customer_pending_orders)
              let no_completed_orders        = response.ccj_count; 
              
              $('.avail_services').empty();
              $('.user_avail_services').empty();
              let all_dep = `<li data-id="" class="">All</li>`;
              let selected_job = ''; let status_cls = '';
              if(allDependencies.length>0)
              {
                console.log('saved_job_filter',saved_job_filter)
                 let sel_class= '';
                $.each(allDependencies,function(index,each_dep){
                   sel_class= '';
                  if(saved_job_filter == each_dep.id){
                    selected_job = each_dep.name;
                    sel_class = 'active';
                  } 
                  all_dep += `<li data-id="${each_dep.id}" class="${sel_class}">${each_dep.name}</li>`;
                })
                console.log('selected_job',selected_job)
              }
              $('.avail_services').html(all_dep);
              setTimeout(function(){
                $('.avail_services').find('li[data-id="'+saved_job_filter+'"]').trigger('click',1)
                $('.avail_filters').find('li[data-id="'+saved_status_filter+'"]').trigger('click',1)
              },100)
              if(userDependencies.length>0)
              {
                let all_udep = '';
                
                console.log('saved_job_filter',saved_job_filter)
                $.each(userDependencies,function(index,each_udep){
                  all_udep += `<option value="${each_udep.id}" data-id="${each_udep.id}">${each_udep.name}</option>`;
                })
                $('.user_avail_services').html(all_udep);
              }
              
              if(data.valid_result){
                $('.pending_jobs_cnt').text('('+Object.keys(customer_pending_orders).length+')');
                $('.completed_jobs_cnt').text('('+no_completed_orders+')');
                if(Object.keys(customer_pending_orders).length>0)
                {
                  let packed_qty = 0; let sp_cls;
                  
                  $.each(customer_pending_orders,function(index,each_data){
                      packed_qty   = 0;
                      sp_cls = each_data.scanned_items_found ? 'item_found' : '';
                      sp_cls += each_data.pending_items == 0 || (each_data.scanned_items_found && each_data.scanned_pending_qty == 0) ? ' packed' : '';
                      // prod_name = (each_data.product_name1_short!='' && each_data.product_name1_short!=null)?each_data.product_name1_short:each_data.product_name1;
                      packed_qty   = Number(each_data.total_items) - Number(each_data.pending_items);
                      // if(rem_qty>0)
                      // {
                      let rejected_icon  = each_data.job_response == '2' ? '<span class="rejected_icon">Rejected</span>' : '';
                      let rejected_cls   = each_data.job_response == '2' ? 'job_rejected' : '';
                      let comments_count = each_data.ord_comments.length > 0 ? '<span class="comments_counter_icon">Comments ('+each_data.ord_comments.length+')</span>' : '';
                      let comments_html  = `<div class="comments_block invisible">`;
                      if(each_data.ord_comments.length > 0){
                          $.each(each_data.ord_comments,function(index1,each_comment){
                            comments_html  += `<p class="each_comment">${each_comment.comments} @ ${each_comment.added_on}</p>`;
                          })
                      }
                      comments_html += '</div>';
                      status_cls = saved_status_filter == '1' ? 'job-completed' : (saved_status_filter == '2' ? 'job-cancelled':'job-pending');
                          item = `<li class="${sp_cls} ${status_cls} ${rejected_cls}" data-order_item="${each_data.order_item}" data-job_id="${each_data.job_id}" data-order_id="${each_data.order_id}" data-item_qty="${each_data.item_qty}" data-order_no="${each_data.order_no}" data-item_files="${each_data.item_files}">
                                        <table class="pro_table">
                                          <tr>
                                            <td class="ord_sl_no" style="width:20%">${each_data.order_no}</td>
                                            <td class="ord_prod_name" style="width:40%">${each_data.orderDate}</td>
                                            <td style="text-align:left" class="ord_qty" style="width:40%">${each_data.job_added}</td>
                                          </tr>
                                          <tr>
                                            <td class="ord_services" colspan="3">Item: <span class="job_item_name">${each_data.item_name}(${each_data.item_unit}) X ${each_data.item_qty}</span></td>
                                          </tr>`;
                              if(each_data.item_remark!=''){
                                 item += `<tr>
                                            <td class="ord_services_desc" colspan="3">** ${each_data.item_remark} **</td>
                                          </tr>`;
                              }
                                item += `<tr>
                                            <td class="ord_services" colspan="3">Service: <span class="job_item_service">${each_data.service_name}</span></td>
                                          </tr>`;
                                        
                              if(each_data.job_remark!='' && each_data.job_remark!=null){
                                 item += `<tr>
                                            <td class="job_remarks" colspan="3">${each_data.job_remark} @${each_data.job_updated}</td>
                                          </tr>`;
                              }
                              if(rejected_icon!='' || comments_count!=''){
                                item += `<tr>
                                            <td class="job_remarks" colspan="3">${rejected_icon} ${comments_count} ${comments_html}</td>
                                          </tr>`;
                              }
                              item += `</table>
                                    </li>`;
                          $('.pending_items').append(item);
                      // }
                                //<td>25.00</td>
                  })

                  // let automated_scan = window.localStorage.getItem('automated_scan');
                  // if($('.pending_items li.item_found').not('.packed').length == 1 && automated_scan == 1)
                  // {
                  //   setTimeout(function(){
                  //     $('.pending_items li.item_found').not('.packed').trigger('click');
                  //     $('.next_block').trigger('click')
                  //   },100)
                  // }
                  // else
                  //   window.localStorage.setItem('automated_scan','0');
                  // $('.tot_packed_item_qty').text(tot_qty);
                }
                else
                {
                  loadErrorPopup('Already Processed','There is no Pending Jobs for the User.')
                }
              }
              else{
                let item = ``;
                item += `<li class="header_row empty_row">
                                      <table class="pro_table"><tr>
                                          <td class="ord_services_desc" style="text-align:center !important" colspan="3">No data found</td>
                                        </tr></table>
                                  </li>`;
                        $('.pending_items').append(item);
              }
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
          removeAjaxLoad();
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
function loadCompletedOrders(reload=true)
{
  loadAjax();
  hostname = window.localStorage.getItem('hostname');
  page_title = window.localStorage.getItem('page_title');
  time_zone = window.localStorage.getItem('time_zone');
  $('.inp_field').val('');
  let cloth_barcode = window.localStorage.getItem('cloth_barcode');
  if(cloth_barcode==undefined || cloth_barcode=='')
    window.location.replace(`landing.html`);
  $.ajax({
        url: base_url+'/packing_api/getCustomerCompletedOrderDetails',
        method: 'POST',
        data: {'client_identifier': client_identifier,'cloth_barcode':cloth_barcode},
        dataType : "JSON",
        success: function(data) 
        {
          // removeAjaxLoad();
          $('.valid_input').val('');
          if(data.status)
          {
            let response = data.data;
            if(Object.keys(response).length > 0)
            {
              let customer_completed_orders = response.cco;
              $('.completed_items').html('');
              if(customer_completed_orders.length>0)
              {
                let packed_qty = 0; let sp_cls='';
                $.each(customer_completed_orders,function(index,each_data){
                    packed_qty   = 0;
                    sp_cls = each_data.scanned_items_found ? 'item_found' : '';
                        item = `<li class="${sp_cls}" data-id="${each_data.id}" data-order_id="${each_data.order_id}" data-scanned_items_found="${each_data.scanned_items_found}" data-total_items="${each_data.total_items}" data-order_no="${each_data.order_no}">
                                      <table class="pro_table">
                                        <tr>
                                          <td class="ord_sl_no" style="width:20%">${each_data.order_no}</td>
                                          <td class="ord_prod_name" style="width:40%">${each_data.orderDate}</td>
                                          <td class="ord_qty" style="width:40%">${each_data.deliveryDate}</td>
                                        </tr>
                                      </table>
                                  </li>`;
                        $('.completed_items').append(item);
                })
                // $('.tot_packed_item_qty').text(tot_qty);
              }
              else
              {
                loadErrorPopup('Alert','No completed orders for this particular customer.')
              }
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
          removeAjaxLoad();
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
function scanClothBarcode(cloth_barcode)
{
  loadAjax();
  if(cloth_barcode==undefined || cloth_barcode=='')
    loadErrorPopup('Alert','Please scan any cloth of the customer')
  $(".mobile_product_list .order_items li").removeClass('active')
  $.ajax({
        url: base_url+'/packing_api/checkClothInOrder',
        method: 'POST',
        data: {'client_identifier': client_identifier,'cloth_barcode':cloth_barcode, 'order_id':$('.order_no').data('order_id')},
        dataType : "JSON",
        success: function(data) 
        {
          // removeAjaxLoad();
          $('.cloth_scan_input').removeClass('fetching_data')
          $('.cloth_scan_input').val('');
          if(data.status)
          {
            let response = data.data;
            if(Object.keys(response).length > 0)
            {
              let order_item = response.customer_cloth;
              console.log(order_item)
              if(order_item)
              {
                let customer_id = $('.cust_data').data('cust_id');
                console.log('customer_id',customer_id)
                // if(customer_id == order_item.customer_id)
                // {
                  if(order_item.item_found === false)
                  {
                    let msg = `Scanned Cloth: ${order_item.product_name1}<br>
                              Scanned cloth not found in the selected order`;
                    loadErrorPopup('Warning',msg);
                  }
                  else if(order_item.pending_qty == 0)
                  {
                    let msg = `Scanned Cloth: ${order_item.product_name1}<br>
                              Scanned cloth found in the selected order, but all the qty already packed`;
                    loadErrorPopup('Warning',msg);
                  }
                  else
                  {
                    let item_found = 0;
                    $(".mobile_product_list .order_items li").each(function(){
                        let prod_id       = $(this).data('prod_id');
                        let prod_barcode  = $(this).data('prod_barcode');
                        if(order_item.product_id == prod_id && order_item.product_barcode == prod_barcode)
                        {
                          item_found = 1;
                          $(this).addClass('active');
                          addSplitItem(1,"scanned");
                        }
                    })
                    if(item_found == 0)
                    {
                      let msg = `Scanned Cloth: ${order_item.product_name1}<br>
                              Scanned cloth found in the selected order, but all the qty already moved for packing`;
                      loadErrorPopup('Warning',msg);
                    }
                  }
                // }
                // else
                // {
                  // loadErrorPopup('Alert','Please scan clothes from the same customer');
                // }
                // $('.tot_packed_item_qty').text(tot_qty);
              }
              else
              {
                loadErrorPopup('Alert','The Order you are trying to open is already packed completely.')
              }
            }
            else
            {
              loadErrorPopup('Software Error','Data not loaded, Contact Support team.','1')
            }
          }
          else
          {
            // $.alert(data.message)
            loadErrorPopup('Alert',data.message)
          }
          removeAjaxLoad();
        },
        error:function(request, status, error)
        {
          $('.cloth_scan_input').removeClass('fetching_data')
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
$(document).ready(function(){
  $(".vertical_down").click(function() {
      $(this).closest('div.scroll-container').find('.scroll_vertically').animate({
          scrollTop: $(this).parent('div').find(".scroll_vertically").scrollTop() + 140 
      }, 100);
  });
  $(".vertical_up").click(function() {
    $(this).closest('div.scroll-container').find('.scroll_vertically').animate({
          scrollTop: $(this).parent('div').find(".scroll_vertically").scrollTop() - 140 
      }, 100);
  });
  $("body").on('click','.split_qty input[type="checkbox"]',function(){
    $('.order_items li').removeClass('active');
    if($(this).prop("checked") == true)
    {
      $('.split_dbl_btn').addClass('disabled_icon');
      $('.split_qty input[type="checkbox"]').prop('checked',true);
      // $(this).attr('data-original-title','Quick Add Enabled');
      localStorage.setItem("split_qty",1);
    } 
    else
    {
      $('.split_dbl_btn').removeClass('disabled_icon');
      $('.split_qty input[type="checkbox"]').prop('checked',false);
      // $(this).attr('data-original-title','Quick Add Disabled');
      localStorage.setItem("split_qty",0);
    }
  });
  $("body").on('click','.order_items li',function()
  {
      let split_qty = localStorage.getItem("split_qty");
      if(split_qty == "1")
      {
          $('.order_items li').removeClass('active')
      }
      $(this).toggleClass('active');
  })
  $("body").on('click','.packed_items li',function()
  {
      let split_qty = localStorage.getItem("split_qty");
      if(split_qty == "1")
      {
          $('.packed_items li').removeClass('active')
      }
      $(this).toggleClass('active');
  })
  $("body").on('click','.split_reset',function(){
    $('.new_sales_cart').empty();
    $('.order_items li').removeClass('active')
    $('.split_btn').trigger('click');   
  })
  $("body").on('click','.split_to_new',function(){
    let split_mode = $(this).data('split_mode');
    // //console.log('split_mode -'+split_mode)
    if(split_mode=='all')
    {
      $('.order_items').find('li').addClass('active');
    } 
    else
    {
      if($('.order_items li.active').length == 0)
      {
        $('.order_items li:first-child').addClass('active');
      }
    } 
    if($('.order_items li.active').length > 0)
    {
      let split_qty = localStorage.getItem("split_qty");
      console.log('split_qty - '+split_qty)
      if(split_qty=='1')
      {
        let ask_qty = "1";
        let qty   = Number($(this).parents('.major_container').find('.order_items li.active').find('.ord_qty').text());
        console.log('qty - '+qty)
        if(ask_qty == "1" && qty > '1')
        { 
          $.confirm({
              title: '<b>Aipsoft Prompt</b>',
              content: '' +
                '<div class="form-group qty_prompt_div">' +
                '<label>Splitting Qty</label>' +
                '<div class="input-group split_count">'+         
                            '<button class="discription_btn_left split_decr" data-dir="dwn"><i class="fas fa-minus"></i></button>'+
                            '<input type="text" class="discription_input split_qty_input black_input_ripple numeric_only" value="1" min="1" max="'+qty+'">'+
                            '<button class="discription_btn_right split_incr" data-dir="up"><i class="fas fa-plus"></i></button>'+
                        '</div>'+
                '</div>'
                ,
              boxWidth: '30%',
              buttons: {
                  ok:{
                    text: 'OK',
                    btnClass: 'btn-blue qty_ok',
                      action: function () {
                          let split_qty_input   = Number(this.$content.find('.split_qty_input').val());
                          if(split_qty_input > qty){
                              return false;
                          }
                          else
                          {
                            // qty = split_qty_input;
                            addSplitItem(split_qty_input);
                          }
                          
                      }
                  },
                  cancel: {
                    action: function (cancel) {
                      // qty = qty;
                      addSplitItem();
                    },
                    text: 'Cancel'
                      //close
                  },
              },
              onContentReady: function () {
                  // bind to events
                  var jc = this;
                  this.$content.find('.split_qty_input').on('keyup', function (e) {
                    let val = $(this).val();
                    if(e.which == 13  || e.keyCode == 13)
                    {
                      if(!isNaN(val))
                        jc.$$ok.trigger('click');
                    }
                  }); 
            }
          }); 
        }
        else
        {
          addSplitItem();
        }
      }
      else
      {
        addSplitItem();
      }
    }
  })
  $("body").on('click','.split_from_new',function(){
    let split_mode = $(this).data('split_mode');
    // //console.log('split_mode -'+split_mode)
    if(split_mode=='all')
    {
       $('.packed_items').find('li').addClass('active');
    } 
    else
    {
      if($('.packed_items li.active').length == 0)
      {
        $('.packed_items li:first-child').addClass('active');
      }
    } 
    if($('.packed_items li.active').length > 0)
    {
      let split_qty = localStorage.getItem("split_qty");
      if(split_qty==1)
      {
        let ask_qty = "1";
        let qty     = Number($(this).parents('.major_container').find('.packed_items li.active').find('.pack_qty').text());
        if(ask_qty == "1" && qty > '1')
        { 
          $.confirm({
              title: '<b>Aipsoft Prompt</b>',
              content: '' +
                '<div class="form-group qty_prompt_div">' +
                '<label>Splitting Qty</label>' +
                '<div class="input-group split_count">'+         
                            '<button class="discription_btn_left split_decr" data-dir="dwn"><i class="fas fa-minus"></i></button>'+
                            '<input type="text" class="discription_input split_qty_input black_input_ripple numeric_only" value="1" min="1" max="'+qty+'">'+
                            '<button class="discription_btn_right split_incr" data-dir="up"><i class="fas fa-plus"></i></button>'+
                        '</div>'+
                '</div>',
              boxWidth: '30%',
              buttons: {
                  ok:{
                    text: 'Ok',
                    btnClass: 'btn-blue qty_ok',
                      action: function () {
                          let split_qty_input   = Number(this.$content.find('.split_qty_input').val());
                          if(split_qty_input > qty){
                              return false;
                          }
                          else
                          {
                            // qty = split_qty_input;
                            removeSplitItem(split_qty_input);
                          }
                          
                      }
                  },
                  cancel: {
                    action: function (cancel) {
                      // qty = qty;
                      removeSplitItem();
                    },
                    text: 'Cancel'
                      //close
                  },
              },
              onContentReady: function () {
                  // bind to events
                  var jc = this;
                  this.$content.find('.split_qty_input').on('keyup', function (e) {
                    let val = $(this).val();
                    if(e.which == 13  || e.keyCode == 13)
                    {
                      if(!isNaN(val))
                        jc.$$ok.trigger('click');
                    }
                  }); 
            }
          }); 
        }
        else
        {
          removeSplitItem();
        }
      }
      else
      {
        removeSplitItem();
      }
    }
  })
  let date_format = 'dd/mm/yyyy';
  $(".packing_date").datepicker({
          format:'dd-mm-yyyy',
          todayHighlight: true,
          autoclose: true,
      }).on('changeDate', function (selected) {
          let minDate = new Date(selected.date.valueOf());
          // $('.del_date').datepicker('setStartDate', minDate);
      });
    $(".del_date").datepicker({format:'dd-mm-yyyy',autoclose: true,todayHighlight: true})
        .on('changeDate', function (selected) {
            //console.log('ddd')
            //console.log(selected)
            let maxDate = new Date(selected.date.valueOf());
            $(".del_date").data('selected_date','')
            // $('.packing_date').datepicker('setEndDate', maxDate);
    });
    $(".del_date").on('blur',function(){
      let ddd = $(".del_date").data('selected_date');
      if(ddd!='' && ddd!=undefined)
        $(".del_date").val(ddd);
    })
    $('.packing_time,.del_time').timepicker({
      showInputs: false
  });   
})
let addSplitItem = function(max_allowed_qty="",mode="")
{
  //console.log('i am called')
  let tot_qty_curr  = Number($('.tot_ord_item_qty').text()); 
  let tot_qty_new   = Number($('.tot_packed_item_qty').text());
  //console.log('tot_qty_curr - '+tot_qty_curr)
  //console.log('tot_qty_new - '+tot_qty_new)
  //console.log('max_allowed_qty - '+max_allowed_qty)
  let new_qty_splitted = 0;
  let new_total_splitted = 0;
  let split_cart = '';
  let sl_no = Number($('.pack_sl_no').length);
  let item_arr = [];
  $('.order_items li.active').each(function()
  {
    let each_sale_entry_id = $(this).data('db_id');
    if(jQuery.inArray( each_sale_entry_id, item_arr )==-1)
    {
      item_arr.push(each_sale_entry_id);
      //console.log('looping started');
      let $this = $(this);
      //console.log('each_sale_entry_id - '+each_sale_entry_id)
      let qty             = Number($(this).find('.ord_qty').text());
      let prod_name       = $(this).find('.ord_prod_name').text();
      //console.log('qty - '+qty)
      let split_flag=0;
      if(max_allowed_qty!='' && max_allowed_qty < qty)
      {
        split_flag=1;
        qty       = Number(max_allowed_qty);
      }
      //console.log('qty - '+qty)
      //console.log('split_flag - '+split_flag)
      new_qty_splitted +=qty;
      //console.log('new_qty_splitted - '+new_qty_splitted)
      // sub_total = sub_total.toFixed(no_of_decimals);
      if($this.parents('.major_container').find('.packed_items').find('.splitted_item_'+each_sale_entry_id).length > 0)
      {
        let existing_qty = Number($this.parents('.major_container').find('.packed_items').find('.splitted_item_'+each_sale_entry_id).find('.pack_qty').text());
        // qty = existing_qty;
        //console.log('existing_qty - '+existing_qty)
        //console.log('qty - '+qty)
        $('.splitted_item_'+each_sale_entry_id).find('.pack_qty').text(qty+existing_qty);
      }
      else
      {
        let unit_name =  $(this).data('unit_name');
        let prod_id =  $(this).data('prod_id');
        let prod_barcode =  $(this).data('prod_barcode');
        let prod_name =  $(this).data('prod_name');
       
        split_cart = `<li class="split_item splitted_item_tr splitted_to splitted_item_${each_sale_entry_id}" data-db_id="${each_sale_entry_id}" data-unit_name="${unit_name}" data-prod_name="${prod_name}" 
                          data-prod_id="${prod_id}" data-prod_barcode="${prod_barcode}">
                        <table class="pro_table">
                          <tr>
                            <td class="pack_sl_no" style="width:10%">${++sl_no}</td>
                            <td class="pack_prod_name" style="width:70%">${prod_name}</td>
                            <td class="pack_qty" style="width:20%">${qty}</td>
                          </tr>
                        </table>
                    </li>`;     
        $('.packed_items').append(split_cart);
      }
      if(split_flag==0)
        $('.split_item_'+each_sale_entry_id).remove();
      else
      {
        let old_qty = Number($this.find('.ord_qty').text());
        //console.log('old_qty - '+old_qty)
        old_qty = old_qty - qty;
        //console.log('qty - '+qty)
        //console.log('old_qty - '+old_qty)
        $('.split_item_'+each_sale_entry_id).find('.ord_qty').text(old_qty);
      }
      $('.splitted_item_'+each_sale_entry_id).removeClass('active');
      if(mode == "scanned")
        $('.mobile_product_list .order_items li').removeClass('active')
    }
  })
  tot_qty_curr = tot_qty_curr-new_qty_splitted;
  tot_qty_new  = tot_qty_new+new_qty_splitted;
  $('.tot_ord_item_qty').text(tot_qty_curr);
  $('.tot_packed_item_qty').text(tot_qty_new);
  packingSerialOrdering();
}
let packingSerialOrdering = function()
{
    //console.log('I am entered here')
    let sl_no=0;
    $('.order_items li').each(function()
    {
        $(this).find('.ord_sl_no').text(++sl_no)
    })
    sl_no=0;
    $('.packed_items li').each(function()
    {
        $(this).find('.pack_sl_no').text(++sl_no)
    })
}
let removeSplitItem = function(max_allowed_qty="")
{
  //console.log('i am called')
  let tot_qty_curr  = Number($('.tot_ord_item_qty').text()); 
  let tot_qty_new   = Number($('.tot_packed_item_qty').text());
  //console.log('tot_qty_curr - '+tot_qty_curr)
  //console.log('tot_qty_new - '+tot_qty_new)
  let new_qty_splitted = 0;
  let new_total_splitted = 0;
  let split_cart = '';
  let sl_no = Number($('.ord_sl_no').length);
  let item_arr = [];
  $('.packed_items li.active').each(function()
  {
    let each_sale_entry_id = $(this).data('db_id');
    if(jQuery.inArray( each_sale_entry_id, item_arr )==-1)
    {
      item_arr.push(each_sale_entry_id);
      //console.log('looping started');
      let $this = $(this);
      //console.log('each_sale_entry_id - '+each_sale_entry_id)
      let qty             = Number($(this).find('.pack_qty').text());
      let prod_name       = $(this).find('.pack_prod_name').text();
      //console.log('qty - '+qty)
      let split_flag=0;
      if(max_allowed_qty!='' && max_allowed_qty < qty)
      {
        split_flag=1;
        qty       = Number(max_allowed_qty);
      }
      //console.log('qty - '+qty)
      //console.log('split_flag - '+split_flag)
      new_qty_splitted +=qty;
      //console.log('new_qty_splitted - '+new_qty_splitted)
      // sub_total = sub_total.toFixed(no_of_decimals);
      if($this.parents('.major_container').find('.order_items').find('.split_item_'+each_sale_entry_id).length > 0)
      {
        let existing_qty = Number($this.parents('.major_container').find('.order_items').find('.split_item_'+each_sale_entry_id).find('.ord_qty').text());
        // qty += existing_qty;
        //console.log('existing_qty - '+existing_qty)
        //console.log('qty - '+qty)
        $('.split_item_'+each_sale_entry_id).find('.ord_qty').text(qty+existing_qty);
      }
      else
      {
        let unit_name =  $(this).data('unit_name');
        let prod_id =  $(this).data('prod_id');
        let prod_barcode =  $(this).data('prod_barcode');
        let prod_name =  $(this).data('prod_name');

        split_cart = `<li class="split_item split_item_tr split_to split_item_${each_sale_entry_id}" data-db_id="${each_sale_entry_id}" data-unit_name="${unit_name}" data-prod_name="${prod_name}" 
                          data-prod_id="${prod_id}" data-prod_barcode="${prod_barcode}">
                        <table class="pro_table">
                          <tr>
                            <td class="ord_sl_no" style="width:10%">${++sl_no}</td>
                            <td class="ord_prod_name" style="width:70%">${prod_name}</td>
                            <td class="ord_qty" style="width:20%">${qty}</td>
                          </tr>
                        </table>
                    </li>`;     
        $('.order_items').append(split_cart);
      }
      if(split_flag==0)
        $('.splitted_item_'+each_sale_entry_id).remove();
      else
      {
        let old_qty = Number($this.find('.pack_qty').text());
        old_qty = old_qty - qty;
        $('.splitted_item_'+each_sale_entry_id).find('.pack_qty').text(old_qty);
      }
      $('.splitted_item_'+each_sale_entry_id).removeClass('active')
    }
  })
  tot_qty_curr = tot_qty_curr+new_qty_splitted;
  tot_qty_new  = tot_qty_new-new_qty_splitted;
  $('.tot_ord_item_qty').text(tot_qty_curr);
  $('.tot_packed_item_qty').text(tot_qty_new);
  packingSerialOrdering();
}
$("body").on('focus','.split_qty_input',function(evt){
  $(this).select();
})
$("body").on('keypress','.numeric_only',function(evt){
  let charCode = (evt.which) ? evt.which : evt.keyCode;
  if(charCode == 46)
  {
    let existing_value = $(this).val();
    //console.log(existing_value.includes('.'));
    if(!existing_value.includes('.'))
      return (charCode > 31 && (charCode < 46 || charCode > 57)) ? false : true
    else
      return false;
  }
  else
   return (charCode > 31 && (charCode == 47 || charCode < 46 || charCode > 57)) ? false : true
});
$(document).on('click', '.split_count button', function () {   
  var btn = $(this),
    oldValue = btn.closest('.split_count').find('input').val().trim(),
    newVal = 0;
    maxVal = Number(btn.closest('.split_count').find('input').attr('max'));
  if (btn.attr('data-dir') == 'up') {
    if(oldValue<maxVal)
    {
      newVal = Number(oldValue) + 1;
    }
    else
    {
      newVal = oldValue;
    }
  } else {
    if (oldValue > 1) {
      newVal = Number(oldValue) - 1;
    } else {
      newVal = 1;
    }
  }
  btn.closest('.split_count').find('input').val(newVal);
}); 
$("body").on("click",".back_btn",function(){
  let page_title = $(this).data('page');
  //console.log(page_title)
  if(page_title=='packing'){
    let origin_from = window.localStorage.getItem('origin_from');
    if(origin_from == 'customer_orders')
      window.location = "customer-orders.html";
    else
      window.location = "landing.html";
  }
})
$("body").on("click",".SubmitBtn",function(){
  let page_title = $(this).data('page');
  if(page_title=='packing')
    set_remarkwithcomma();
    submitPacking();
})
function submitPacking()
{
  let final_packed_product_list    = [];
  let item_arr = [];
  $(".splitted_item_tr").each(function(){
    let each_db_id = $(this).data('db_id');
    if(jQuery.inArray(each_db_id,item_arr )==-1)
    {
      item_arr.push(each_db_id);
      let qty             = $(this).find('.pack_qty').text();
      final_packed_product_list.push({'item_db_id':each_db_id,'pack_qty':qty});
    }
  });
  if(final_packed_product_list.length == 0)
  { 
    loadErrorPopup('Empty Prompt','No items added for packing')
    return false;
  }
  let order_id  = window.localStorage.getItem('current_order_id'); 
  let branch_id = $('.order_branch').val();
  let packing_date = $('.packing_date').val();
  let packing_time = $('.packing_time').val();
  let del_date  = $('.del_date').val();
  let del_time  = $('.del_time').val();
  let salesman  = $('.salesman').val();
  let remark    = $('.remark_final').val();
  let packing_note = $('.packing_note').val();
  let bal_qty   = Number($('.tot_ord_item_qty').text());
  let full_packed = bal_qty>0?0:1;
  let send_sms  = $(".send_sms input[type='checkbox']").is(":checked") ? '1' : '0';
  let send_whatsapp  = $(".send_whatsapp input[type='checkbox']").is(":checked") ? '1' : '0';
  window.localStorage.setItem('send_sms',send_sms);
  window.localStorage.setItem('send_whatsapp',send_whatsapp);
  // return false;
  let file_ids = [];
  $(".image_list_ul li").each(function(){
      file_ids.push($(this).data('file'));
  });
  time_zone = window.localStorage.getItem('time_zone');
  if(order_id!='')
  {
    loadAjax();
    $.ajax({
        url      : base_url+"/packing_api/savePacking",
        type     : "POST",
        data     : {'client_identifier': client_identifier,'order_id': order_id,'branch_id':branch_id,'packing_date':packing_date,'packing_time':packing_time,'del_date':del_date,'del_time':del_time,'salesman':salesman,'send_sms':send_sms,'send_whatsapp':send_whatsapp,'final_packed_product_list':final_packed_product_list,'time_zone':time_zone,'user_id':user_id,'full_packed':full_packed, 'remark':remark, 'packing_note':packing_note, 'file_ids':file_ids},
        dataType : "JSON",
        success: function(data) 
        {
          removeAjaxLoad();
          $('.valid_input').val('');
          if(data.status==1)
          {
            if(send_whatsapp == 1 && data.whatsapp_response.mobile_valid)
            {
              if(data.direct_whastapp == 1)
              {
                let api = 'https://textconnect.aipsoft.com/api/send/whatsapp';
                whatsapp_share_ajax(data.wa_sms_username,data.wa_sms_password,data.whatsapp_response.whatsapp_text,data.whatsapp_response.mobile,api);
              }
              else
              {
                let whatsapp_pre_text = "https://wa.me/+"+data.whatsapp_response.mobile+"?text=";
                var linkk = data.whatsapp_response.whatsapp_text;
                var encodedURL = encodeURIComponent(linkk);
                let whatsapp_full_text = whatsapp_pre_text+encodedURL;
                console.log(whatsapp_full_text); 
                $(".whatsapp_a").attr('href',whatsapp_full_text);
                setTimeout(function() {
                  //document.getElementById("whatsapp_a").click();  
                    //$(".whatsapp_a").trigger('click');
                    $('#whatsapp_a')[0].click();
                    $('#whatsapp_a').mousedown();
                  },100);
              }
            }
            window.localStorage.setItem('current_order_id','');
              $.confirm({
                  title: 'Saving Successful',
                  content: 'Your packing saved successfully.',
                  boxWidth: '50%',
                  useBootstrap: false,
                  icon: 'fas fa-exclamation-triangle',
                  backgroundDismissAnimation: 'glow',
                  type: 'green',
                  autoClose: 'redirectUser|20000',
                  buttons: {
                      redirectUser: {
                          text: 'Next packing - ',
                          action: function () {
                              window.location.replace(`landing.html`);
                          }
                      }
                  }
              });
          }
        },
        error:function(request, status, error)
        {
          removeAjaxLoad();
          loadErrorPopup('Saving Error','Something went wrong, Please try again')
          return false;
        }
    });
  }
  else
  {
    loadErrorPopup('Saving Error','Mandatory fields missing')
    return false;
  }
}
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
$("body").on("click",".ReSendNotify",function(){
  let order_id  = window.localStorage.getItem('current_order_id'); 
  let invoice_id= window.localStorage.getItem('current_invoice_id'); 
  let branch_id = window.localStorage.getItem('branch_id');
  let user_name = $('#acc_username').val();
  if(order_id!='' || invoice_id!='')
  {
    loadAjax();
    $.ajax({
        url      : base_url+"/packing_api/resendNotification",
        type     : "POST",
        data     : {'client_identifier': client_identifier,'order_id': order_id,'invoice_id': invoice_id,'branch_id':branch_id,'user_id':user_id,'user_name':user_name},
        dataType : "JSON",
        success: function(data) 
        {
          removeAjaxLoad();
          if(data.status==1)
          {
            let api = 'https://textconnect.aipsoft.com/api/send/whatsapp';
            whatsapp_share_ajax(data.wa_sms_username,data.wa_sms_password,data.whatsapp_response.whatsapp_text,data.whatsapp_response.mobile,api);
            window.localStorage.setItem('current_order_id','');
              $.confirm({
                  title: 'Notification Send',
                  content: 'Your notification send successfully.',
                  boxWidth: '50%',
                  useBootstrap: false,
                  icon: 'fas fa-exclamation-triangle',
                  backgroundDismissAnimation: 'glow',
                  type: 'green',
                  autoClose: 'redirectUser|20000',
                  buttons: {
                      redirectUser: {
                          text: 'Redirecting - ',
                          action: function () {
                              window.location.replace(`landing.html`);
                          }
                      }
                  }
              });
          }
        },
        error:function(request, status, error)
        {
          removeAjaxLoad();
          loadErrorPopup('Saving Error','Something went wrong, Please try again')
          return false;
        }
    });
  }
  else
  {
    loadErrorPopup('Saving Error','Mandatory fields missing')
    return false;
  }
})
$(document).ready(function() {
    $('.upload_img_pop').click(function(){
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
                        let upload_api_link = api_url + '/packing_api/DeleteImg';
                        let img_urls = [];
                        let file_ids = [];
                        $(".img").each(function(){
                            img_urls.push($(this).data('img_file_name'));
                            file_ids.push($(this).data('file_id'));
                        });
                        
                        // console.log(img_urls);
                        // return false;
                        let page_name = document.location.pathname.match(/[^\/]+$/)[0];
                        let image_mode = 'packing_img';
                        if(page_name=='my-jobs.html')
                          image_mode = 'item_img';
                        $.ajax({
                            url: upload_api_link,
                            type:'POST',
                            data:{'img_urls':img_urls,'file_ids':file_ids,'client_identifier':client_identifier,'image_mode':image_mode},
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
        let upload_api_link = api_url + '/packing_api/UploadImg'
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
                    $(".image_list_ul").append(`<li data-file="${data['file_id']}">
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
        let page_name = document.location.pathname.match(/[^\/]+$/)[0];
        let image_mode = 'packing_img';
        if(page_name=='my-jobs.html')
          image_mode = 'item_img';
        
        formData.append('images',$('.file-input')[0].files[0]);
        formData.append('client_identifier',client_identifier);
        formData.append('imei_id',imei_id);
        formData.append('image_mode',image_mode);
        let url   = this.value;
        let ext   = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
        console.log(ext);
        var reader = new FileReader();
        reader.onload = function (e) {
            image_upload();
        }
        reader.readAsDataURL(this.files[0]);
    });  
})
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