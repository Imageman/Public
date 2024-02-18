
document.getElementByName = function (id) {
    oo2 = document.getElementsByName(id);
    return oo2[0];
}

Number.prototype.getFStr=function(fillNum){var fillNum=fillNum?fillNum:2;var 
temp=""+this;while(temp.length<fillNum)temp="0"+temp;return temp;}

var getFStr = function (str, fillNum) {
	var fillNum=fillNum?fillNum:2;
	var temp=""+str;
	while(temp.length<fillNum)temp="0"+temp;
	return temp;
}

var autoAppendChild = function (targetObject, nodeX) {
    // берем nodeX и смотрим его тип.
    // потом ищем среди предков targetObject такой же тип
    // и в самый конец добавляем nodeX

    var target = targetObject;
    while (target && target.tagName != nodeX.tagName) {
        target = target.parentNode;
    }
    if (!target) {
        //debugger;
        // что-то не нашли подходящего предка!
        target = targetObject;
    }
    target.appendChild(nodeX);
    return target;
}


function selectText(element) {
    // выделяем весь текст внутри элемента element (например внутри div)
    var doc = document;
    var text = doc.getElementById(element);
    var range;
    var selection;

    if (doc.body.createTextRange) { // ms
        range = doc.body.createTextRange();
        range.moveToElementText(text);
        range.select();
    } else if (window.getSelection) { // moz, opera, webkit
        selection = window.getSelection();
        range = doc.createRange();
        range.selectNodeContents(text);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

var addMessage = function createMessage(id,url1, url2, url3, downloads, views, age) {	
	var Score=0+(1*downloads+0.04*views)/Math.sqrt(age);
	Score=(Score*1000).toFixed(0);
      $('addLinks').innerHTML +='<br>call d '+id+' '+ url1+' '+url2+' '+url3+' '+ getFStr(Score,5) +' '+downloads+' '+age.toFixed(0);
}

var getLinksD = function getLinksD() {
	return jQuery('a.item-mask');	
}

var gogo = function gogo() {
	var links=getLinksD();
	$('addLinks').innerHTML +='<br> links: '+links.length;
	debugger;
	var i;
	var timeout_good;
	for (i = 0; i < links.length; i++) {
		jQuery.ajax({
			global:false,
			timeout:925000,
			dataType:'text',
			url: links[i].href,
			success: function(data){
				processPage(data);
				selectText('addLinks');
				clearTimeout(timeout_good);
				timeout_good = setTimeout('document.title ="############ Ok?"', 8000)
			}
		});	
	}
}

var addJQ = function addJQ() {
	if (typeof(jQuery) != 'function') {
		var script = document.createElement('script');
		script.src = "https://code.jquery.com/jquery.js";
		document.documentElement.appendChild(script);
	}
}
setTimeout('addJQ()', 5000);
//setTimeout('gogo()', 10000);


var processPage = function processPage(html1) {
	//debugger;
     var Views=html1.match( /Views:[\D]+([0-9]+)[\D]+Uploaded on/i );
     var Downloads=html1.match( /Downloads:[\D]+([0-9]+)[\D]+Views:/i );	 
	 var ID=html1.match( /Stock Photo:[\D]+([0-9]+)[\D]+Contributor:/i );
	 var DataU=html1.match( /Uploaded on:[\D]+([0-9]+)-([0-9]+)-([0-9]+)[\D]+<\/table>/i );
	 var Data= new Date(20+DataU[3], DataU[1]-1, DataU[2]);
	 var age=(new Date().getTime()-Data.getTime())/(1000*60*60*24);	 
	 var width=html1.match( /thumb.{1,300}jpg.{1,300}width[\D]+([0-9]+)/i );
     var height=html1.match( /thumb.{1,300}jpg.{1,300}height[\D]+([0-9]+)/i  );
	 var jpegURL1='http://www.istockphoto.com/image-zoom/'+ID[1]+'/1/'+width[1]+'/'+height[1]+'/zoom-'+ID[1]+'-1.jpg';
	 var jpegURL2='http://www.istockphoto.com/image-zoom/'+ID[1]+'/2/'+width[1]+'/'+height[1]+'/zoom-'+ID[1]+'-2.jpg';
	 var jpegURL3='http://www.istockphoto.com/image-zoom/'+ID[1]+'/3/'+width[1]+'/'+height[1]+'/zoom-'+ID[1]+'-3.jpg';
		console.log('Jpeg: ' + jpegURL1);

	 addMessage(ID[1], jpegURL1,jpegURL2,jpegURL3,Downloads[1],Views[1],age);
}

function addLinksM() {
	console.log('Start addLinksM: ' + window.location.href);
	 
     var adf = document.createElement('DIV');
     with (adf.style) {
     backgroundColor = '#FFFFCC';
     border = '1px solid DarkOrange';
     position = 'fixed';
     position = 'releative';
     top = '20px';
     left = '100px';
     font = '8px Verdana, Tahoma, sans-serif';
     padding = '2px';
     textAlign = 'center';
     }
     adf.id = 'addLinks';
     adf.innerHTML='[<a href="close" onclick="javascript:{document.getElementById(\'addLinks\').style.left=\'-3999px\';return false;}">### close ###</a>]<br/>';     
     adf.innerHTML+='[<a href="#" onclick="javascript:{gogo();return false;}">### GoGo ###</a>]<br/>';     
     document.body.appendChild(adf);
	 
	 //processPage( document.body.innerHTML);
     
	
    // сначала вытягиваем из плеера параметры
    var flashval = jQuery('.b-fullpost__player object[name ^= audioplayer] param[name ^= flashvars]').val();
	if (flashval==undefined)
	{// что-то пошло не так, пробуем упростить
		var flashval = jQuery('object[name ^= audioplayer] param[name ^= flashvars]').val();
	}
	if (flashval==undefined)
	{// вообще плохо дело, пытаемся повторить позже
		window.setTimeout(addLinks, 1000);
		return false;
	}
	
    // начинаем парсить параметры
    var k = [];
    k = flashval.split('&');
    var p = k[1].split('=');
    // берем тот параметр, что отвечает за адрес плейлиста
    var PlsUrl = p[1];
   
    var result = {};
    result.innerHTML = '<a id="playLST" href="' + PlsUrl + '">playlist</a>';
    result.firstNode = window.document.getElementsByClassName('b-searchpost__text')[0] || jQuery('.b-searchpost__text')[0];
    //result.firstNode=jQuery('.fullstory');

    var messageElem = createMessage(result.innerHTML);
    messageElem.style.font = '6px Tahoma,Verdana, sans-serif';
    messageElem.style.textAlign = 'center';
    messageElem.style.verticalAlign = 'center';
    try {
        autoAppendChild(result.firstNode, messageElem);
    } catch (e) {
        debugger;
        console.log('Error append element (div): ' + e.message);
    }

    jQuery['getJSON'](PlsUrl,
        function (json) {
            var link1 = document.getElementById('playLST');
            link1.innerHTML = '';
            debugger;
            var html1 = ''
            for (var i = 0; i < json['playlist'].length ; i++) {
                html1 += json['playlist'][i]['file'] + '<BR>';
            }
            link1.innerHTML = html1;
            //jQuery('#addLinks').innerHTML=json['playlist'][0]['file'];
            selectText('playLST');

            jQuery('#playLST')['error'](function () {
                jQuery('#playLST').val("error");
            });

        });

}

addLinksM();
