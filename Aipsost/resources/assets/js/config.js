// android and ios configuration

let installing_os       = 'android';//'android' // ios; //system   

 window.localStorage.setItem('installing_os',installing_os);
 let barcode_camera =  window.localStorage.getItem('barcode_camera');
 barcode_camera = (barcode_camera != null && barcode_camera != '')?barcode_camera:1;

if(installing_os == 'ios')
    {
        let online_script = document.createElement("script");
        online_script.setAttribute("src","main.js");
        online_script.setAttribute("id","ios_script");
        online_script.onload = function(){
            console.log('Done');
        }
        document.head.appendChild(online_script);
    }

    function open_camera(os=installing_os,barcode=barcode_camera,qr=0)
    {
        if(barcode == 1 || qr == 1)
        {
           if(os == 'ios')
            {
                sendLoginAction();
            }
            else if (os == 'android')
            {
                ok.openBarcode();
            } 
        }
    }

     function get_device_data(os=installing_os)
    {  
        // $.alert(installing_os);
        // console.log('im here');
        if(os == 'ios')
        {
            GetDeviceData();
        }
        else if (os == 'android')
        {

            ok.GetDeviceData();
        }
        else
        {

            window.localStorage.setItem('imei_id','iimm'+Date.now());
        }

    }


function goBackPage()
{
let path = window.location.pathname;
let page = path.split("/").pop();
let pagename = page.split('.').slice(0, -1).join('.')
let back_page = 'home.html';
    switch(pagename) {
  case 'grn_supplier':
   back_page = 'grn.html';
    break;
  case 'grv_supplier':
    back_page = 'grv.html';
    break;
  case 'grv_supplier':
    back_page = 'grv.html';
    break;
  case 'retrive_convert':
    back_page = 'scan.html';
    break;
  case 'retrive_convert':
    back_page = 'scan.html';
    break;      
  default:
    back_page = 'home.html';
}

window.location = back_page;

}