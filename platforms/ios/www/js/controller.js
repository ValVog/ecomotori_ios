/*******************************************
 *          controller.js
 *  @description:       file js che contiene e contiene le classi view, maps, modulo e app
 *  @creation_date:     17/02/2016
 *  @version:           1.0.0
 *  @author:
 ********************************************/

// APP
//      controller dell'applicazione
app = (function(){
    var pub={};
    pub.storageLocal = window.localStorage;

    /*******************************************
     * @name:                initialize
     * @visibility:          public
     * @description:         Application Constructor
     * @param:               -
     ********************************************/
    pub.initialize= function () {
        pub.bindEvents();
    };

    /*******************************************
     * @name:                bindEvents
     * @visibility:          public
     * @description:         Bind Event Listeners: bind gli eventi principali, viene eseguito in caricamento dell'app
     * @param:               -
     ********************************************/
    pub.bindEvents= function () {
        //render contenuto della view principale(maps)
        view.renderPage('showMap');
        maps.loadMap();

        //bind vista listaDati
        $(".header .btn_header #showList").on("tap",
            function (e) {
                e.preventDefault();
                view.renderPage('showList');
                modulo.showListaDati();
            }
        );
        $(".header .btn_header .pageBack").on("tap",
            function (e) {
                e.preventDefault();
                view.renderPage('showMap');
                //maps.reloadMap();
                if( $("#left-panel").hasClass("ui-panel-open") ) {
                    $("#left-panel").panel("close");
                }
            }
        );

        //carico menù
        pub.bindLeftMenu();
    };

    /*******************************************
     * @name:                bindLeftMenu
     * @visibility:          public
     * @description:         funzione di bind degli eventi base del menù
     * @param:               -
     ********************************************/
    pub.bindLeftMenu= function () {
        //view.setActive();

        //in caso di swipe si deve aprire/chiudere il menù
       $(document).on("swipeleft",
            function (e) {
                e.preventDefault();
                if( !$("#left-panel").hasClass("ui-panel-open") ) {
                    $(".left-panel").panel("open");
                }
            }
        );
        $(document).on("swiperight",
            function (e) {
                e.preventDefault();
                if( $("#left-panel").hasClass("ui-panel-open") ) {
                    $(".left-panel").panel("close");
                }
            }
        );

        //bind ad ogni link la sua pagina da visualizzare
        $("#left-panel a").on("tap",
            function (e) {
                e.preventDefault();
                var id='#'+$(this).data('id');
                var classNames=$(id).attr("class");
                var clName='.'+(classNames.split(" "))[0];
                if(id!='#showNew' && id!='#about') {
                    view.renderPage('showMap');
                    view.setFilter(clName, id);
                    maps.reloadMap();
                }else if(id=='#about'){
                    var shadow=document.getElementsByClassName('popup_shadow')[0];
                    var about_container=document.getElementsByClassName('about')[0];
                    var about_content=document.getElementsByClassName('about_content')[0];
                    shadow.setAttribute('style','display: block !important');
                    about_container.setAttribute('style','display: block !important');
                    about_content.setAttribute('style','display: block !important');
                    $(about_container, 'div#map_canvas').on("tap",
                        function (e) {
                            e.preventDefault();
                            view.closeAbout();
                        }
                    );

                    $(about_content).html('TEST>UO TEST>UO TEST>UO TEST>UO ');
                }else {
                    if( localStorage['msgNewDistrib']==null || !localStorage['msgNewDistrib'] ){
                        view.showConfirm(
                            "Aiutaci a migliorare quest'app! Segnalaci nuovi distributori.",
                            "Nuovo Distributore",
                            [
                                'Continua e non mostrare più.',
                                'Si, va bene!'
                            ],
                            function(buttonIndex){
                                if (buttonIndex==1) localStorage['msgNewDistrib']=true;
                            }
                        );
                    }
                    view.renderPage('showNew');
                }
                $("#left-panel").panel("close");
            }
        );
    };

    /*******************************************
     * @name:               calcolaCosto
     * @visibility:         public
     * @return              double
     *      costo:              ritorna il costo del carburante di cui necessita
     *      -1:                 -1 per indicare che non ha trovato prezzi
     * @description:        funzione che calcola il costo del carburante del marker passatogli come parametro
     * @param:
     *       @param_name     @param_type     @param_desc
     *       dataMarker         Object          oggetto dei dati del marker
     ********************************************/
    pub.calcolaCosto= function (dataMarker) {
        var elPrezzi=dataMarker.prezzi;
        var indice=-1;
        if(elPrezzi.length > 0) {
            indice=0;
            for (var i = 0; i < elPrezzi.length; i++) {
                if(app.storageLocal.getItem('tipoCarburante')!=0) {
                    if (elPrezzi[i].idcarburante == app.storageLocal.getItem('tipoCarburante')) {
                        indice = i;
                    }
                }else{
                    if(elPrezzi[i].costo>elPrezzi[indice].costo)
                        indice=i;
                }
            }
        }

        return ( indice > -1 && indice < elPrezzi.length ?
                    elPrezzi[indice].costo
                :
                    indice
        );
    };

    /*******************************************
     * @name:               calcolaPathImage
     * @visibility:         public
     * @return              string
     *      src:               una stringa contenente il percorso dell'immagine da visualizzare nel marker passatogli come parametro
     * @description:        funzione che calcola il path dell'immagine del carburante del marker passatogli come parametro
     * @param:
     *       @param_name     @param_type     @param_desc
     *       dataMarker         Object          oggetto dei dati del marker
     ********************************************/
    pub.calcolaPathImage= function (dataMarker, errorImage) {
        var src = "img/google/misc.png";
        var elPrezzi=dataMarker.prezzi;
        //calcolo il pat dell'src
        if(dataMarker.bandiera != null && !errorImage) {
            src = 'http://www.ecomotori.net/distributori/'+dataMarker.bandiera;
        }else if(elPrezzi.length > 0) {
            for (var i = 0; i < elPrezzi.length; i++) {
                if (app.storageLocal.getItem('tipoCarburante')==0) {
                    switch (elPrezzi[i].idcarburante) {
                        case 1:
                            src = "img/google/colonnine_elettriche.png";
                            break;
                        case 4:
                            src = "img/google/gpl.png";
                            break;
                        case 5:
                            src = "img/google/metano.png";
                            break;
                    }
                }else{
                    if(elPrezzi[i].idcarburante==app.storageLocal.getItem('tipoCarburante')) {
                        switch (elPrezzi[i].idcarburante) {
                            case 1:
                                src = "img/google/colonnine_elettriche.png";
                                break;
                            case 4:
                                src = "img/google/gpl.png";
                                break;
                            case 5:
                                src = "img/google/metano.png";
                                break;
                        }
                    }
                }
            }
        }

        return src;
    };

    /*******************************************
     * @name:               isMobile
     * @visibility:         public
     * @return              boolean
     *      true:               il dispositivo è MOBILE
     *      false:              il dispositivo è DESKTOP
     * @description:        funzione di controllo per definire se l'app è eseguita da mobile(return true) o dal browser(return false)
     * @param:              -
     ********************************************/
    pub.isMobile= function () {
        var a = navigator.userAgent || navigator.vendor || window.opera;
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
        {
            return true;
        }
        return false;
    };

    /*******************************************
     * @name:                getDateFromISO
     * @visibility:          public
     * @description:         funzione che riceve la data nel formato 00000000T00:00:00 e lo converte in formato dd mmm, aaaa (es. 01 mar 2016)
     * @param:
     *       @param_name     @param_type     @param_desc
     *       date_string      stringa         data sotto forma di stringa nel formato 00000000T00:00:00
     ********************************************/
    pub.getDateFromISO= function(date_string){
        var date_toUse='Non disponibile';
        if(date_string!=null && date_string!='' && date_string!='00000000T00:00:00') {
            var anno = date_string.substr(0, 4);
            var mese = date_string.substr(4, 2);
            var resto = date_string.substr(6, -1);
            var date = new Date(Date.parse(anno + '-' + mese + '-' + resto));
            var month = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
            date_toUse = date.getDate() + " " + month[date.getMonth()] + ", " + date.getFullYear();
        }
        return date_toUse;
    };

    /*******************************************
     * @name:                addStyle
     * @visibility:          public
     * @description:         funzione che carica file css nell'html
     * @param:
     *       @param_name     @param_type     @param_desc
     *       style_name      stringa         nome del file da caricare.
     ********************************************/
    pub.addStyle= function(style_name){
        var script=document.createElement('style');
        script.setAttribute('type', 'text/css');
        script.setAttribute('href', style_name);
        document.body.appendChild(script);
    };

    /*******************************************
     * @name:                addScript
     * @visibility:          public
     * @description:         funzione che carica file javascript nell'html
     * @param:
     *       @param_name     @param_type     @param_desc
     *       script_name     stringa         nome del file da caricare.
     ********************************************/
    pub.addScript= function(script_name){
        var script=document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('src', script_name);
        document.body.appendChild(script);
    };

    pub.supportsToDataURL= function (){
        var c = document.createElement("canvas");
        var data = c.toDataURL("image/png");
        return (data.indexOf("data:image/png") == 0);
    };

    return pub;
})();//end APP


//* MODULO
//      desc:               model per la gestione dei dati
//      variable:
//          pub             variabile per definire i mettodi pubblicij della "classe" modulo
//          pub.storage     storage interno al modulo con i dati ricevuti dal server
//          pub.bandiere    elenco dei file immagine già caricati dei vari distributori (le immagini sono circa 15/20 e si ripetono)
//*/
modulo = (function (){
    var pub = {};
    pub.storage = {};
    pub.bandiere = {};


    /*******************************************
     * @name:               showListaDati
     * @visibility:         public
     * @description:        creo la lista dei dati da visualizzare in base ai dati salvati nello storage
     * @param:              -
     ********************************************/
    pub.showListaDati= function(){
        var elencoDati = $("#ulViewDati");
        elencoDati.html("");

        if(pub.storage) {
            for (var i in pub.storage) {
                var sk=pub.storage;
                var ogg=pub.storage[i];
                maps.createMarkerGraphics(ogg, 1, function(draw, ogg){
                    var img=new Image();
                    img.src=draw.icon;
                    var parent = $("<li data-theme='c'></li>");
                    var li_title=$("<div class='li_title'></div>");
                    var li_left=$("<div class='li_left'></div>");
                    var li_right=$("<div class='li_right'>" +
                        "<a href='#"+ogg['iddistributore']+"' data-transition='slide'>" +
                        ogg['indirizzo'] +
                        "</a><br />"+
                        ogg['comune']+
                        "</div><div style='clear: both;'></div>");
                    li_left.append(img);
                    li_title.append(li_left);
                    li_title.append(li_right);
                    parent.append(li_title);

                    if( $('#sub_'+ogg['iddistributore']).length==0 ) {
                        var ul = $("<table class='sub_table_carburante' data-theme='c'></table>");
                        var ul_sub = "";
                        for (var o in ogg['prezzi']) {
                            var sub_obj = ogg['prezzi'][o];
                            ul_sub = $("<tr data-theme='c' class='sub_tr_price'></tr>");

                            //colonna img
                            var src_carburante='img/google/misc.png';
                            switch(sub_obj['idcarburante']){
                                case 1:
                                    src_carburante='img/google/colonnine_elettriche.png';
                                    break;
                                case 4:
                                    src_carburante='img/google/gpl.png';
                                    break;
                                case 5:
                                    src_carburante='img/google/metano.png';
                                    break;
                            }
                            var li_sub = $("<td data-theme='c'>" +
                                '<img src="'+src_carburante+'" />'+
                                "</td>");
                            li_sub.addClass('first_column');
                            ul_sub.append(li_sub);

                            //colonna nomeCarburante
                            var li_sub = $("<td data-theme='c'>" +
                                sub_obj['nomecarburante'] +
                                "</td>");
                            ul_sub.append(li_sub);

                            //colonna costo
                            li_sub = $("<td data-theme='c'>" +
                                (sub_obj['costo']==0?'Non<br />disponibile':sub_obj['costo'] + ' ' + sub_obj['valuta']) +
                                "</td>");
                            ul_sub.append(li_sub);

                            //colonna dataUltimoAggiornamento
                            var date_string= app.getDateFromISO(sub_obj['datarilevamento']);
                            li_sub = $("<td data-theme='c'>" +
                                date_string +
                                "</td>");
                            li_sub.addClass('last_column');
                            ul_sub.append(li_sub);
                            ul.append(ul_sub);
                        }
                        //ul.append(li);

                        if (sk) {
                            ogg = null;
                        }

                        parent.append(ul);
                    }else{
                        $('#sub_'+ogg['iddistributore']).remove();
                    }

                   elencoDati.append(parent);
               });
            }
        }else elencoDati.append($("<li data-theme='c'>Non ci sono Indirizzi salvati!</li>"));

        elencoDati.listview("refresh");
    };


    /******
     * @name:               getMarkersforArea
     * @visibility:         public
     * @description:
     * @param:
     *       @param_name    @param_type     @param_desc
     *       zoom             stringa         la variabile zoom indentifica lo zoom della mappa e serve per calcolare i km di richiesta dei marker da visualizzare
     *       lat              stringa         lat stringa che contenente la latitudine del punto centrale di ricerca
     *       lng              stringa         longstringa che contenente la longitudine del punto centrale di ricerca
     *
     * INDIRIZZO LISTA DATI: http://app.ecomotori.net/restfull/index.php/distributori
     * variabili in get:
     *      carburante = [ 1=>metano, 4=>gpl, 5=>colonnine elettriche ]
     *      filtro_aperti = true/false
     *      ricerca = testo indirizzo
     *      posgps = testo pos gps "lat;lon"
     *      range = numerico in km (calcolato in base allo zoom)
     *      show_dist = da in risposta anche la distanza in linea d'aria rispetto alla posgps (da usare solo quando si guarda la lista e non la mappa)
     ****/
    pub.getMarkersforArea= function(zoom, lat, lng, callback){
        var fasce={
            8   : 100,
            13  : 50,
            18  : 20,
            23  : 5
        };

        var center=lat+";"+lng;
        var km= fasce[23];
        if(zoom<=8) km = fasce[8];
        else if(zoom <= 13) km= fasce[13];
        else if(zoom <= 18) km= fasce[18];

        var data={ //parametri di richiesta
            'posgps'        : center,
            'range'         : km,
            'carburante'    : app.storageLocal.getItem('tipoCarburante')
        };
        var filterActive=app.storageLocal.getItem('filter');
        if(filterActive!=null && filterActive==2){
            data['filtro_aperti']=true;
        }

        $.ajax({
            url             : "http://app.ecomotori.net/restfull/index.php/distributori",
            type            : "GET",    //meglio usare GET quando si tratta di sola lettura
            data            : data,
            contentType     : "application/json; charset=utf-8",
            dataType        : "jsonp",
            jsonp           : 'callback',
            success         : function(data, status) { callback(data);},
            error           : function(error,status) { },
        }); //end ajax
    };

    /******
     * @name:               updateStorage
     * @visibility:         public
     * @description:	   funzione che aggiorna i dati dello storage interno di modulo; inserendo i dati che mancano rispetto alla lista contenuta in temp(parametro passato)
     * @param:
     *       @param_name    @param_type     @param_desc
     *       temp        obj_distributori   oggetto con l'elenco dei distributori
     ****/
/*    pub.updateStorage= function(temp) {
        console.log('aggiorno i dati!');
        if(app.storageLocal.getItem('filter')!=null && app.storageLocal.getItem('filter')==1){
            for(var indice in temp){
                if(temp.autostradale!=0){
                    var counter=temp[indice]['iddistributore']
                    if(!pub.storage[counter])
                        pub.storage[counter]=temp[indice];
                }
            }
        }else{
            for(var indice in temp){
                var c=temp[indice]['iddistributore'];
                pub.storage[c]=temp[indice];
            }
        }
    };*/

    /******
     * @name:               updateStorage
     * @visibility:         public
     * @description:	   funzione che elimina i dati dello storage interno di modulo se non presenti nella lista di dati temp(parametro passato)
     * @param:
     *       @param_name    @param_type     @param_desc
     *       temp        obj_distributori   oggetto con l'elenco dei nuovi distributori
     ****/
    pub.updateStorage= function (temp) {
        var i=0;
        /*for (var indice in pub.storage) {
            var val = pub.storage[indice];
            var trovato = false;
            i = 0;
            for (i in temp) {
                if (temp[i] == val){
                    trovato = true;
                    break;
                }
            }

            if (!trovato) {
                delete pub.storage[indice];
            }
        }*/
        pub.storage={};
        for (i in temp) {
            var filterActive=app.storageLocal.getItem('filter');
            if(filterActive!=null && filterActive==1 && temp[i]['autostradale'] != 1) continue;
            pub.storage[temp[i]['iddistributore']]=temp[i];
        }
    };

    /******
     * @name:               emptyStorage
     * @visibility:         public
     * @description:	    funzione che svuota lo storage di modulo
     * @param:
     *       -
     ****/
    pub.emptyStorage= function () {
        pub.storage={};
    };

    /******
     * @name:               clearLocalStorage
     * @visibility:         public
     * @description:	    funzione che svuota lo storage dell'app
     * @param:
     *       -
     ****/
    pub.clearLocalStorage= function () {
        app.storageLocal.clear();
    };

    return pub;
})();//end MODULO

// VIEW
//      desc:           view gestisce le view e il template
//      variable:
//          pub         variabile per definire i mettodi pubblicij della "classe" modulo
//          page        variabile con l'elenco delle pagine come indici ed ad ogni elemento è contenuta le informazioni principali di una pagina(titolo_pagina, id_div_page, nome_classe_da_visualizzare)
//*/
view = (function () {
    var pub={};
    //array page: informazioni generiche delle view.
    var page={
        'showMap': {
            'id'    :   'viewMap',
            'class'     :  'map_page',
            'title'     :   'Mappa Distributori'
        },
        'showList': {
            'id'    :   'viewDati',
            'class'     :  'list_page',
            'title'     :   'Elenco Distributori'
        },
        'showNew': {
            'id'    :   'viewNew',
            'class'     :  'new_page',
            'title'     :   'Nuovo Distributore'
        },
        'showEdit': {
            'id'    :   'viewEdit',
            'class'     :  'edit_page',
            'title'     :   'Aggiorna Distributore'
        },
        'showInfo': {
            'id'    :   'viewInfo',
            'class'     :  'info_page',
            'title'     :   'Info Distributore'
        }
    };

    /*******************************************
     * @name:                renderPage
     * @visibility:          public
     * @description:         definisce quali parti dell'app visualizzare in base al parametro page_name passato
     * @param:
     *       @param_name        @param_type         @param_desc
     *       page_name          stringa             identifica la pagina da caricare può assumere solo 3 valori:  'map', 'list', 'data'
     *       ins                intero              indica se si è in inserimento o meno
     *
     *  ins = 1 -> inserimento dati,
     *  ins = 0 -> pagina diversa da inserimento
     ********************************************/
    pub.renderPage= function(page_name) {
        $('.page').attr("id", page[page_name]['id']);
        $('.header>h1.'+page[page_name].class).html(page[page_name].title);
        var lista_page = ['showMap', 'showList', 'showNew', 'showEdit', 'showInfo'];
        for(var k in lista_page) {
            p=lista_page[k];
            if(page_name==p) {
                $('.' + page[page_name].class).attr('style', 'display: block !important');
            }else{
                $('.' +  page[p].class).attr('style', 'display: none !important');
            }
        }
        max_height(page[page_name]['id']);
    };

    /*******************************************
     * @name:                exit
     * @visibility:          public
     * @description:         uscita dall'applicazione
     * @param:               -
     ********************************************/
    pub.exit= function() {
        pub.showConfirm(
            "Vuoi uscire dall'applicazione?",
            function(buttonIndex) {
                //istruzione:navigator.app.exitApp <-- interna di Cordova per mobile
                //app si riferuisce ad una proprietà di navigator
                if (buttonIndex == 1)
                    navigator.app.exitApp();
            },
            "Informazione",
            ["Sì","No"]
        );
    };

    /******
     * @name:               nomeMetodo
     * @visibility:         public/private
     * @return              [tipoValoreRitorno]
     *      varToRetrun:        descrizione valore ritorno e possibili valori
     * @description:	   descrizione metodo.....
     * @param:
     *       @param_name    @param_type     @param_desc
     *       param1         [tipoParam]         descrizione del parametro ed scopo
     *       param2         [tipoParam]         descrizione del parametro ed scopo
     ****/
    pub.showConfirm= function (msg, title, button, callback){
        if(app.isMobile()) navigator.notification.confirm(msg, callback, title, button);
        else{
            var m=window.confirm(msg);
            callback(m);
        }
    };

    /******
     * @name:               nomeMetodo
     * @visibility:         public/private
     * @return              [tipoValoreRitorno]
     *      varToRetrun:        descrizione valore ritorno e possibili valori
     * @description:	   descrizione metodo.....
     * @param:
     *       @param_name    @param_type     @param_desc
     *       param1         [tipoParam]         descrizione del parametro ed scopo
     *       param2         [tipoParam]         descrizione del parametro ed scopo
     ****/
    pub.showAlert= function (msg, title, button, callback){
        if(app.isMobile()) navigator.notification.alert(msg, callback, title, button);
        else window.alert(msg);
    };

    /******
     * @name:               nomeMetodo
     * @visibility:         public/private
     * @return              [tipoValoreRitorno]
     *      varToRetrun:        descrizione valore ritorno e possibili valori
     * @description:	   descrizione metodo.....
     * @param:
     *       @param_name    @param_type     @param_desc
     *       param1         [tipoParam]         descrizione del parametro ed scopo
     *       param2         [tipoParam]         descrizione del parametro ed scopo
     ****/
    pub.setActive= function(){
        var typeFuel= app.storageLocal.getItem('tipoCarburante');
        var typeFilter= app.storageLocal.getItem('filter');
        var id;
        if(typeFuel!=null) {
            switch (parseInt(typeFuel)) {
                case 1:
                    id='#showMetano';
                    break;
                case 4:
                    id='#showGpl';
                    break;
                case 5:
                    id='#showElettriche';
                    break;
            }
            $(id).addClass('active');
        }

        switch (parseInt(typeFilter)) {
            case 1:
                id='#filterAutostrade';
                break;
            case 2:
                id='#filterOpen';
                break;
            default:
                id='#noFilter';
                break;
        }

        $(id).addClass('active');
        //$(".active").append($("<span></span>"));
    };

    /******
     * @name:               setActiveById
     * @visibility:         public
     * @description:	    funzione che imposta l'elemento attivo nel menu(left_pannel) in base ad un id fornito
     * @param:
     *       @param_name    @param_type     @param_desc
     *       id             stringa         stringa che continee l'id dell'elemento da rendere "attivo"
     ****/
    pub.setActiveById= function(id){
        $(id).addClass('active');
        //$(".active").append($("<span></span>"));
    };

    /******
     * @name:               setFilter
     * @visibility:         public
     * @description:	    funzione che imposta il filtro delle richieste dei dati al server (tipo_carburante, solo_distrib_aperti, solo_distrib_autostrada, no_filter)
     * @param:
     *       @param_name    @param_type     @param_desc
     *       className      string          nome della classe, permette di capire il tipo di filtro da applicare alla richiesta
     *       id             string          id definisce il filtro vero e proprio da applicare
     ****/
    pub.setFilter= function(className, id) {
        $(className).removeClass('active');
        if(className=='.show') {
            switch (id) {
                case "#showGpl":
                    app.storageLocal.setItem('tipoCarburante', 4);
                    break;
                case "#showMetano":
                    app.storageLocal.setItem('tipoCarburante', 1);
                    break;
                case "#showElettriche":
                    app.storageLocal.setItem('tipoCarburante', 5);
                    break;
                default:
                    app.storageLocal.setItem('tipoCarburante', 0);
            }
        }else{
            switch (id) {
                case "#filterOpen":
                    app.storageLocal.setItem('filter', 2);
                    break;
                case "#filterAutostrade":
                    app.storageLocal.setItem('filter', 1);
                    break;
                default:
                    app.storageLocal.setItem('filter', 0);
                    break;
            }
        }
        view.setActiveById(id);
    };

    /******
     * @name:               nomeMetodo
     * @visibility:         public/private
     * @return              [tipoValoreRitorno]
     *      varToRetrun:        descrizione valore ritorno e possibili valori
     * @description:	   descrizione metodo.....
     * @param:
     *       @param_name    @param_type     @param_desc
     *       param1         [tipoParam]         descrizione del parametro ed scopo
     *       param2         [tipoParam]         descrizione del parametro ed scopo
     ****/
    pub.createPopupMarker= function (dataMarker, marker, mappa) {
        mappa.panTo(marker.getPosition());
        var shadow=document.getElementsByClassName('popup_shadow')[0];
        var container=document.getElementsByClassName('popup_marker')[0];
        var content=document.getElementsByClassName('popup_marker_content')[0];
        shadow.setAttribute('style','display: block !important');
        container.setAttribute('style','display: block !important');
        $(container).on("tap",
            function (e) {
                e.preventDefault();
                pub.closePopupMarker();
                //e.stopPropagation();
            }
        );

        $(content).html('');
        var content_black='';
        var content_green=$('<div id="green_marker_popup"></div>');
        for(var i in dataMarker['prezzi']) {
            var ogg=dataMarker['prezzi'][i];
            var date_string= app.getDateFromISO(ogg['datarilevamento']);
            var nome_carburante=(ogg['nomecarburante']=='Colonnine_Elettriche'?'Colonnine Elettriche':ogg['nomecarburante']);
            content_black=$('<div class="black_marker_popup"></div>');
            content_black.html('<ul><li class="value_marker">'+nome_carburante + ':</li><li class="value_marker" id="costo_marker">' +
                ogg['costo'] + ' ' + ogg['valuta'] + '</li><li class="value_marker">' +
                date_string)+'</li></ul>';
            $(content).append(content_black);
        }
        content_green.html('<ul class="ul_btn_marker_popup">'+
                '<li class="li_btn_marker_popup"><a data-role="button" id="findRoad" data-id="findRoad" href="#findRoad">Nav</a></li>'+
                '<li class="li_btn_marker_popup"><a data-role="button" id="showEdit" data-id="showEdit" href="#viewEdit">Edit</a></li>'+
                '<li class="li_btn_marker_popup last_btn_marker_popup"><a data-role="button" id="showInfo" data-id="showInfo" href="#viewInfo">Info</a></li>'+
            '</ul><div class="clear"></div>'
        );

        $("ul.ul_btn_marker_popup>li.li_btn_marker_popup>a#showEdit", content_green).on("tap click",
            function (e) {
                e.preventDefault();
                pub.renderPage('showEdit');
                showUpdateDistrib(dataMarker);
            }
        );

        $("ul.ul_btn_marker_popup>li.li_btn_marker_popup>a#showInfo", content_green).on("tap click",
            function (e) {
                e.preventDefault();
                pub.renderPage('showInfo');
                showInfoDistrib(dataMarker);
            }
        );
        $(content).append(content_green);
        $(content).append($('<div class="clear"></div>'));
        //visualizzo subito "content" in modo da avere la sua altezza e quindi calcolare il top per il suo posizionamento
        content.setAttribute('style','display: block !important;');
        var top=($('body').outerHeight()-$(content).outerHeight()-content_green.outerHeight())/2;
        content.setAttribute('style', content.getAttribute('style') + ' top:'+top+'px;');
    };

    /******
     * @name:               nomeMetodo
     * @visibility:         public/private
     * @return              [tipoValoreRitorno]
     *      varToRetrun:        descrizione valore ritorno e possibili valori
     * @description:	   descrizione metodo.....
     * @param:
     *       @param_name    @param_type     @param_desc
     *       param1         [tipoParam]         descrizione del parametro ed scopo
     *       param2         [tipoParam]         descrizione del parametro ed scopo
     ****/
    pub.closePopupMarker= function() {
        var shadow=document.getElementsByClassName('popup_shadow')[0];
        var container=document.getElementsByClassName('popup_marker')[0];
        var content=document.getElementsByClassName('popup_marker_content')[0];
        shadow.setAttribute('style','display: none !important');
        container.setAttribute('style','display: none !important');
        content.setAttribute('style','display: none !important');
    };

    /******
     * @name:               nomeMetodo
     * @visibility:         public/private
     * @return              [tipoValoreRitorno]
     *      varToRetrun:        descrizione valore ritorno e possibili valori
     * @description:	   descrizione metodo.....
     * @param:
     *       @param_name    @param_type     @param_desc
     *       param1         [tipoParam]         descrizione del parametro ed scopo
     *       param2         [tipoParam]         descrizione del parametro ed scopo
     ****/
    pub.onMapChangeEvent= function() {
        return (function() {
            clearTimeout(app.storageLocal['timer']);
            app.storageLocal['timer'] = setTimeout(function() {
                modulo.getMarkersforArea(
                    maps.getMap().getZoom(),
                    maps.getMap().getCenter().lat(),
                    maps.getMap().getCenter().lng(),
                    function(req){
                        if (!req.error) {
                            modulo.updateStorage(req.distributori);
                            //associazione cambio eventi mappa
                            maps.redefineMarkerMap();
                        }
                    }
                );
            }, 1500);
        }());
    };

    /******
     * @name:               nomeMetodo
     * @visibility:         public/private
     * @return              [tipoValoreRitorno]
     *      varToRetrun:        descrizione valore ritorno e possibili valori
     * @description:	   descrizione metodo.....
     * @param:
     *       @param_name    @param_type     @param_desc
     *       param1         [tipoParam]         descrizione del parametro ed scopo
     *       param2         [tipoParam]         descrizione del parametro ed scopo
     ****/
    showUpdateDistrib=function(dataMarker){
        $('.content>div#viewEdit').html('');
        $('.content>div#viewEdit').html('AGGIOOOOOOOOORNAAAA:<br />'+JSON.stringify(dataMarker));
    }

    /******
     * @name:               nomeMetodo
     * @visibility:         public/private
     * @return              [tipoValoreRitorno]
     *      varToRetrun:        descrizione valore ritorno e possibili valori
     * @description:	   descrizione metodo.....
     * @param:
     *       @param_name    @param_type     @param_desc
     *       param1         [tipoParam]         descrizione del parametro ed scopo
     *       param2         [tipoParam]         descrizione del parametro ed scopo
     ****/
    showInfoDistrib=function(dataMarker){
        $('.content> div#viewInfo').html('');
        $('.content>div#viewInfo').html('INFOOOOOO:<br />'+JSON.stringify(dataMarker));
    }

    /*******************************************
     * @name:               max_height
     * @visibility:         private
     * @description:        ricalcolo delle dimensioni del content
     * @param:              -
     ********************************************/
    max_height= function (id) {
        var header = $.mobile.activePage.find("div[data-role='header']:visible");
        var content = $.mobile.activePage.find("div[data-role='content']:visible:visible");
        var viewport_height = $(window).height();

        var diffContentHeight = content.outerHeight() - content.height();
        var content_height = viewport_height - header.outerHeight() - diffContentHeight;
        $('.content').height(content_height);
        $('#'+id).height(content_height);
    };

    /******
     * @name:               closeAbout
     * @visibility:         public
     * @return              [tipoValoreRitorno]
     *      varToRetrun:        descrizione valore ritorno e possibili valori
     * @description:	   descrizione metodo.....
     * @param:
     *       @param_name    @param_type     @param_desc
     *       param1         [tipoParam]         descrizione del parametro ed scopo
     *       param2         [tipoParam]         descrizione del parametro ed scopo
     ****/
    pub.closeAbout= function() {
        var shadow=document.getElementsByClassName('popup_shadow')[0];
        var container=document.getElementsByClassName('about')[0];
        var content=document.getElementsByClassName('about_content')[0];
        shadow.setAttribute('style','display: none !important');
        container.setAttribute('style','display: none !important');
        content.setAttribute('style','display: none !important');
    };

    return pub;
})();//end VIEW

// MAPS
//      desc:           gestisce la mappa di google maps
//      variable:
//          pub         variabile per definire i mettodi pubblicij della "classe" modulo
//          mappa       variabile che definisce la mappa di google e che contine l'oggetto MAPS
//          mks         variabile che continee l'elenco dei markers caricati sulla mappa
//*/
maps = (function() {
    var pub={};
    var mappa= null;
    var mks=[];

    /*******************************************
     * @name:                loadMap
     * @visibility:          public
     * @description:         inizializza la mappa al primo avvio
     * @param:               -
     ********************************************/
    pub.loadMap= function () {
        var div = $('#map_canvas')[0];

        if(app.storageLocal.getItem('tipoCarburante')==null) {
            view.showConfirm(
                "Seleziona un carburante predefinito:",
                "Scelta carburtante.",
                ['GPL', 'Metano', 'Elettrico'],
                function(selected){
                    var id;
                    if(!app.isMobile()){
                        selected=2;
                    }
                    switch (selected) {
                        case 1:
                            app.storageLocal.setItem('tipoCarburante', 4);
                            id='#showGpl';
                            break;
                        case 2:
                            app.storageLocal.setItem('tipoCarburante', 1);
                            id='#showMetano';
                            break;
                        case 3:
                            app.storageLocal.setItem('tipoCarburante', 5);
                            id='#showElettriche';
                            break;
                    }
                    view.setActiveById(id);
                }
            );
        }

        (function (callback) {
            var options = {maximumAge: 0, timeout: 5000, enableHighAccuracy:true};
            navigator.geolocation.getCurrentPosition(
                function (position) {//onSuccess
                    mappa = new google.maps.Map(
                        div,
                        {
                            'center': new google.maps.LatLng(
                                position.coords.latitude,
                                position.coords.longitude
                            ),
                            'zoom': 15,
                            'mapTypeId': google.maps.MapTypeId.ROADMAP
                        }
                    );
                    //associazione cambio eventi mappa
                    mappa.addListener('bounds_changed', function(){view.onMapChangeEvent();});

                    callback();
                },
                function (error) {//onError
                    mappa = new google.maps.Map(
                        div,
                        {
                            'center': new google.maps.LatLng(
                                45.515231,  // latitude
                                 9.261367     // longitude
                            ),
                            'zoom': 15,
                            'mapTypeId': google.maps.MapTypeId.ROADMAP
                        }
                    );
                    view.showAlert('Il gps è disattivo o al momento la posizione non è disponibile.', 'Attenzione!', 'OK', {})

                    callback();
                },
                options
            );
        })(function(){
            //associazione cambio eventi mappa
            mappa.addListener(
                'bounds_changed',
                function(){
                    view.onMapChangeEvent();
                }
            );
            reloadMapUse(0);
        });
    };

    /*******************************************
     * @name:                reloadMap
     * @visibility:          public
     * @description:         funzione che reimposta la mappa in base alle dimensioni dello schermo e ricarica i marker sulla mappa stessa
     * @param:               -
     ********************************************/
    pub.reloadMap= function () {
        reloadMapUse(1);
    };

    /*******************************************
     * @name:                reloadMapUse
     * @visibility:          public
     * @description:         funzione che reimposta la mappa in base alle dimensioni dello schermo e ricarica i marker sulla mappa stessa
     * @param:
     *       @param_name    @param_type     @param_desc
     *       init           intero          valore per definire se è la prima inizializzazione della mappa o meno, in modo da diversificare le operazioni (1 = da_inizializzare, 0 = da_uggiornare)
     ********************************************/
    reloadMapUse= function (init) {
        view.setActive();
        max_heightMap();
        var center= maps.getMap().getCenter();
        var zoom= maps.getMap().getZoom();
        if(init) {
            modulo.getMarkersforArea(zoom,
                center.lat(),
                center.lng(),
                function (req) {
                    if (!req.error) {
                        modulo.updateStorage(req.distributori);
                        pub.redefineMarkerMap();
                    }
                }
            );
        }
    };


    /*******************************************
     * @name:                createMarker
     * @visibility:          private
     * @description:         crea un marker sulla mappa in base ai dati ricevuti dal parametro 'dataMarker'
     * @param:
     *       @param_name        @param_type                 @param_desc
     *       dataMarker         ogggetto(vedi sotto)        oggetto cone le informazioni del marker
     *
     * dataMarker{
     *      'latitude' : double
     *      'longitude' : double
     *      'codice' : string(IDENTIFIER)
     *      'indirizzo' : string
     *      'tipo' : int
     *      'prezzo' : double
     * }
     ********************************************/
    createMarker= function (dataMarker, callback) {
        pub.createMarkerGraphics(dataMarker, 0, function(draw){
            var marker= new google.maps.Marker(
                {
                    'position': new google.maps.LatLng(dataMarker['latitudine'], dataMarker['longitudine']),
                    'styles': draw.style,
                    'icon': draw.icon,
                    'map': mappa,
                    'animation' : google.maps.Animation.DROP,
                    'infoClick' : function() {
                        view.showAlert("InfoWindow is clicked", null, null, null);
                    }
                }
            );
            google.maps.event.addListener(marker, "click", function (e) {
                return view.createPopupMarker(dataMarker, marker, mappa);
            });

            callback(marker);
        });
    };

    /*******************************************
     * @name:                createMarkerGraphics
     * @visibility:          private
     * @description:         crea la grafica di un marker sfrutta anche i dati ricevuti dal parametro 'dataMarker'
     * @param:
     *       @param_name        @param_type                 @param_desc
     *       dataMarker         ogggetto(vedi sotto)        oggetto cone le informazioni del marker
     *
     * dataMarker{
     *      'latitude' : double
     *      'longitude' : double
     *      'Code' : string(IDENTIFIER)
     *      'indirizzo' : string
     *      'tipo' : int
     *      'prezzo' : double
     * }
     ********************************************/
    pub.createMarkerGraphics= function (dataMarker, pr, callback) {
        //DEFINE CANVAS
        var canvas = document.createElement('canvas');
        canvas.className="canvas_marker";
        var shift_top=9;

        //GLOBAL CANVAS STYLE
        canvas.height=81;
        canvas.width = 58;

        //IMAGE
        dataMarker.img = new Image();
        dataMarker.img.setAttribute('crossOrigin', 'anonymous');

        //definisco l'immagine
        dataMarker.img.onload = function() {
            if ('naturalHeight' in this) {
                if (this.naturalHeight + this.naturalWidth === 0) {
                    this.onerror();
                    return;
                }
            } else if (this.width + this.height == 0) {
                this.onerror();
                return;
            }
            graphicsMarker(dataMarker, canvas, shift_top, pr, callback);
        };

        dataMarker.img.src=app.calcolaPathImage(dataMarker, 0);

        //Img Error
        dataMarker.img.onerror = function (){
            //dataMarker.img = new Image();
            //definisco le dimensioni dell'immagine
            dataMarker.img.onload = function() {
                graphicsMarker(dataMarker, canvas, shift_top, pr, callback);
            };
            dataMarker.img.src=app.calcolaPathImage(dataMarker, 1);
        };
       /* var costo=app.calcolaCosto(dataMarker);
        var prezzo='0';
        var x_text='20';
        if(costo!=0) {
            prezzo = ''+(costo.toFixed(3));
            x_text='6.5';
        }
        prezzo+= ' '+dataMarker.valuta;
        app.calcolaPathImage(dataMarker, 0, function(src){
            var svg_tag= '<svg xmlns="http://www.w3.org/2000/svg"' +
                '	xmlns:xlink="http://www.w3.org/1999/xlink"' +
                '	xmlns:ev="http://www.w3.org/2001/xml-events"' +
                '	width="60"' +
                '	height="85">' +
                '	<defs>' +
                '		<pattern id="img1" patternUnits="userSpaceOnUse" width="47.5" height="47.5">' +
                '			<image xlink:href="'+src+'" x="12.5" y="12.5" width="35" height="35" />' +
                '		</pattern>' +
                '	</defs>' +
                '	<path id="svg_triangle" d="M2.5 75 L57.5 75 L30 85 Z" style="fill:#0000ff; stroke-width:0;" />'+
                '	<path id="svg_rect" d="M2.5 30 L57.5 30 L57.5 75 L2.5 75 Z" style="fill:#0000ff; stroke-width:0;" />'+
                '	<g id="svg_circle" style="stroke:#0000ff; stroke-width:4; fill:#ffffff;" >'+
                '		<circle cx="30" cy="30" r="28" />' +
                '	</g>' +
                '	<g id="svg_text" text-anchor="middle" style="fill:#fff; font-weight:bold;" >'+
                '		<text x="30" y="70">'+prezzo+'</text>' +
                '	</g>' +
                '	<path id="svg_rect_img" d="M12.5 12.5 L47.5 12.5 L47.5 47.5 L12.5 47.5 Z" style="fill:url(#img1) #000 ; stroke-width:0;" />' +
                '</svg>';
            //console.log(src);
            //console.log(svg);

            var style={'text-align': 'center'};

            callback( {
                'icon' 		:	{path:svg_tag, scale:2},
                'style'		:	style
            });
        });*/
    };

    /******
     * @name:               nomeMetodo
     * @visibility:         public/private
     * @return              [tipoValoreRitorno]
     *      varToRetrun:        descrizione valore ritorno e possibili valori
     * @description:	   descrizione metodo.....
     * @param:
     *       @param_name    @param_type     @param_desc
     *       param1         [tipoParam]         descrizione del parametro ed scopo
     *       param2         [tipoParam]         descrizione del parametro ed scopo
     ****/
    imgMarkerOnLoad= function(img, canvas, context){
        var ratio= Math.min(
                (canvas.width-26) / img.width,
                (canvas.height-36) / img.height
        );
        var img_width=Math.round(img.width*ratio);
        var img_height=img.height*img_width/img.width;

        var centerShift_x = canvas.width/2-(img_width)/2;
        var centerShift_y = canvas.height/4-(img_height)/4;//va nella parte superiore del canvas quindi ddivido per 4 anzichè 2

        context.drawImage(
            img,                // img element
            0,                  // offset interno X dell'img
            0,                  // offset interno Y dell'img
            img.width,          // width iniziale di img
            img.height,         // height iniziale di img
            centerShift_x,      // coordinata X da impsotare ad img per definire la posizione nel canvas
            centerShift_y,      // coordinata Y da impsotare ad img per definire la posizione nel canvas
            img_width, // width da impsotare ad img
            img_height  // height da impsotare ad img
        );

        //DISEGNA COMPONENTI STROKE (TESTO ESCLUSO)
        context.stroke();

        var style={'text-align': 'center'};//, 'font-weight': 'bold'};
        if(!app.supportsToDataURL()){
            console.log('non supportato');
        }
        return {
            'icon' 		:	canvas.toDataURL(),
            'style'		:	style,
            'ratio'     :   ratio
        };
    };

    /*******************************************
     * @name:               redefineMarkerMap
     * @visibility:         private
     * @description:        rimuove un marker dalla mappa in base al marker che gli viene passato per parametro
     * @param:
     *       @param_name        @param_type                 @param_desc
     *       marker             ogggetto(vedi desc)         oggetto di tipo marker di google
     ********************************************/
    pub.redefineMarkerMap= function() {
        //azzero i markers
        for (var i = 0; i < mks.length; i++) {
            mks[i].setMap(null);
        }
        mks=[];

        for(var indice in modulo.storage){
            (function(distributore) {
                createMarker(distributore, function (marker) {
                    mks.push(marker);
                });
            })(modulo.storage[indice]);
        }
    };

    /*******************************************
     * @name:               removeMarker
     * @visibility:         private
     * @description:        rimuove un marker dalla mappa in base al marker che gli viene passato per parametro
     * @param:
     *       @param_name        @param_type                 @param_desc
     *       marker             ogggetto(vedi desc)         oggetto di tipo marker di google
     ********************************************/
    removeMarker= function (marker) {
        marker.remove();
    };

    /*******************************************
     * @name:               graphicsMarker
     * @visibility:         private
     * @description:        rimuove un marker dalla mappa in base al marker che gli viene passato per parametro
     * @param:
     *       @param_name        @param_type                 @param_desc
     *       marker             ogggetto(vedi desc)         oggetto di tipo marker di google
     ********************************************/
    graphicsMarker= function (dataMarker, canvas, shift_top, pr, callback) {
        var context=canvas.getContext('2d');
        var img=dataMarker['img'];
        var color=(dataMarker.autostradale==0?'#0000ff':'#00bb00');

        //dimensioni cerchi
        var radius=25;
        var radius_inc=3;
        //dimensioni rettangolo
        var widthRect=45;
        var heightRect=40;

        //disegno il RECTANGLE
        var tip=1;
        var centerX=(canvas.width-widthRect)/2;
        var centerY=(canvas.height-heightRect)/2+shift_top;
        context.beginPath();
        context.fillStyle = color;      //colore riempimento
        context.rect(centerX, centerY, widthRect, heightRect);
        context.fill();
        context.closePath();

        //disegno i CERCHI
        var centerShift_x=(canvas.width/2);
        var centerShift_y=(canvas.height/4)+shift_top;
        //cerchio esterno blu
        context.beginPath();
        context.fillStyle = color;      //colore riempimento
        context.arc(centerShift_x, centerShift_y, (radius + radius_inc), 0, 2*Math.PI, false);
        context.fill();
        context.closePath();
        //cerchio esterno blu
        context.beginPath();
        context.fillStyle = '#ffffff';      //colore riempimento
        context.arc(centerShift_x, centerShift_y, radius, 0, 2*Math.PI, false);
        context.fill();
        context.closePath();

        //inseisco il TESTO
        if(pr==0) {
            var costo = app.calcolaCosto(dataMarker);
            costo = (costo > 0 ? costo : 0);
            context.beginPath();
            context.textAlign = 'center';
            context.font = 'normal 9pt Times New Roman';
            context.strokeStyle = '#fff';      //colore riempimento
            context.strokeText(costo + ' ' + dataMarker.valuta, canvas.width / 2, centerY + heightRect - 3);
            context.fill();
            context.closePath();
        }

        //disegno il TRIANGOLO (rimepimento autimatico di colore di linee disegnate tra 3 punti)
        context.beginPath();
        // round dei bordi
        context.lineJoin = "round";
        context.lineWidth = 2;
        var diffRadius=1;
        context.fillStyle = color;      //colore riempimento
        context.strokeStyle = color;      //colore bordo
        // punto in alto a sx del triangolo
        context.moveTo(
            centerX + diffRadius,
            centerY + heightRect
        );
        // vertice basso del triangolo
        context.lineTo(
            centerX + (widthRect / 2),
            centerY + heightRect + 10
        );
        // punto in alto a dx del triangolo
        context.lineTo(
            centerX - diffRadius + widthRect,
            centerY + heightRect
        );
        context.fill();
        context.closePath();

        callback(imgMarkerOnLoad(img, canvas, context), dataMarker);
    };

    /*******************************************
     * @name:               getMap
     * @return              boolean
     *      mappa:               l'oggetto mappa di google maps
     *      null:                la mappa non esiste
     * @visibility:         public
     * @description:        restituisce la mappa(oggetto) contenuta in questa classe
     * @param:              -
     ********************************************/
    pub.getMap= function(){
        return mappa;
    };

    /*******************************************
     * @name:               getMarkersList
     * @return              markers
     *      mks:               elenco dei markers caricati sulla mappa
     *      null:               markers vuoto
     * @visibility:         public
     * @description:        restituisce l'elenco dei markers attualmente caricati sulla mappa
     * @param:              -
     ********************************************/
    pub.getMarkersList= function(){
        return mks;
    };

    /*******************************************
     * @name:               getMarker
     * @return              markers
     *      mks:               elenco dei markers caricati sulla mappa
     *      null:               markers vuoto
     * @visibility:         public
     * @description:        restituisce l'elenco dei markers attualmente caricati sulla mappa
     * @param:              -
     ********************************************/
    pub.getMarker= function(i){
        return mks[i];
    };

    /*******************************************
     * @name:               setMarkersList
     * @return              markers
     *      mks:               elenco dei markers caricati sulla mappa
     *      null:               markers vuoto
     * @visibility:         public
     * @description:        restituisce l'elenco dei markers attualmente caricati sulla mappa
     * @param:              -
     ********************************************/
    pub.setMarkersList= function(ms){
        mks=ms;
    };

    /*******************************************
     * @name:               setMarker
     * @return              markers
     *      mks:               elenco dei markers caricati sulla mappa
     *      null:               markers vuoto
     * @visibility:         public
     * @description:        restituisce l'elenco dei markers attualmente caricati sulla mappa
     * @param:              -
     ********************************************/
    pub.setMarker= function(m){
        mks.push(m);
    };

    /*******************************************
     * @name:               max_heightMap
     * @visibility:         private
     * @description:        ricalcolo delle dimensioni del content
     * @param:              -
     ********************************************/
    max_heightMap= function () {
        var header = $.mobile.activePage.find("div[data-role='header']:visible");
        var footer = $.mobile.activePage.find("div[data-role='footer']:visible");
        var content = $.mobile.activePage.find("div[data-role='content']:visible:visible");
        var viewport_height = $(window).height();

        var diffContentHeight = content.outerHeight() - content.height();
        var content_height = viewport_height - header.outerHeight() - diffContentHeight;
        $('.content').height(content_height);
        $('#map_canvas').height(content_height);
    };

    return pub;
})();//end oggetto maps



//************** INIZIO ESECUZIONE **************//
//  eseguo il js appena la schermata dell'app    //
//              è stata caricata                 //
//***********************************************//
if(!app.isMobile())
{
    document.addEventListener('DOMContentLoaded', function() {
        app.initialize();
    }, false);
}else {
    app.addScript('cordova.js');
    document.addEventListener("deviceready",function() {
        app.initialize();
    }, false);
}