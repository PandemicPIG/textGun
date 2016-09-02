/* text gun */
/*
    Do not remove or edit anything from this file or I'll trace you down and kill you ...slowly. :) Always ask!
*/
Machine_gun = function(data,debug,prod_start)
{
    var _this = this; //to use only if needed
    
    this.data = data;
    this.debug = debug;
    this.prod_start = (typeof prod_start == 'undefined' ? true : prod_start);
    
    if(typeof data.id == 'undefined') this.data.id = 'text';
    if(typeof data.global_string == 'undefined') this.data.global_string = 'No{2}# string#{3}{$detected}';
    if(typeof data.vars == 'undefined') this.data.vars = {detected:'detected'};
    if(typeof data.no_data == 'undefined') this.data.no_data = 'ERROR:42';
    if(typeof data.ms_per_letter == 'undefined') this.data.ms_per_letter = 42;
    if(typeof data.min_ms_per_show == 'undefined') this.data.min_ms_per_show = 200;
    if(typeof data.animation_type == 'undefined') this.data.animation_type = 'zoom-animation';
    if(typeof data.animation_exceptions == 'undefined') this.data.animation_exceptions = {};

    this.time_multi_arr = [];
    
    this.scroll = {};
    if(data.scroll_enable == true) this.scroll.id = this.data.scroll_id;
    if(data.scroll_enable == true) this.scroll.scroll_enable = true;
    else if(document.getElementById(data.scroll_id)) document.getElementById(data.scroll_id).style.display = 'none';
    this.scroll.scroll_time = [];
    this.scroll.scroll_start = [];
    this.scroll.scroll_end = [];
    this.scroll.html_data = [];
    this.scroll.scroll_total = -1;
    this.scroll.delay_time = data.scroll_stop_delay;
    this.scroll.scroll_max = data.scroll_count;
    
    if( typeof data.back_time == 'undefined' ) this.back_time = 250;
    else this.back_time = data.back_time;
    
    if( typeof data.scroll_tranz == 'undefined' ) this.scroll_tranz = 150;
    else this.scroll_tranz = data.scroll_tranz;
    
    if( typeof data.show_scroll_after == 'undefined' ) this.show_scroll_after = 0;
    else this.show_scroll_after = data.show_scroll_after;
    
    var words = this.brake_bones(data.global_string);
   
    if( typeof data.scroll_end_stop == 'undefined' || data.scroll_end_stop == 0 ) this.scroll.scroll_end_stop = words.length;
    else this.scroll.scroll_end_stop = data.scroll_end_stop;
    
    if( this.show_scroll_after > 0 && data.scroll_enable == true) document.getElementById(this.scroll.id).style.opacity = 0;
    
    for(var i = 0; i < words.length; i++)
    {
        var elm = words[i];
        var stop_data = elm.match(/\s?{stop(\s+)?\$([A-Za-z0-9_]+)(\s+)?(\$[0-9\.]+)?(\s?)+(\$\d+\-\d+)?(\s?)+}\s?/);

        elm = elm.replace(/\s?{stop(\s+)?\$([A-Za-z0-9_])+(\s+)?(\$[0-9\.]+)?(\s?)+(\$\d+\-\d+)?(\s?)+}\s?/, "");
        var time_multiplyer = elm.match(/{([\d\.,]+)}/);
        elm = elm.replace(/\s?{[\d\.,]+}\s?/g,'');
        var multip = 1;
        if( time_multiplyer != null ) multip = parseFloat(time_multiplyer[1]);
        
        this.time_multi_arr[i] = multip;
        
        var var_time = Math.floor(elm.replace(/[^A-Za-z0-9]/gi, "").length * data.ms_per_letter * multip);
        if( var_time < this.data.min_ms_per_show ) var_time = this.data.min_ms_per_show;
        
        this.scroll.scroll_time[i] = var_time;
        this.scroll.scroll_start[i] = this.scroll.scroll_total;
        this.scroll.scroll_total += var_time;
        this.scroll.scroll_end[i] = this.scroll.scroll_total - 1;
        
        document.getElementById(data.id).innerHTML += '<div>' + elm + '</div>';
        
        if( stop_data != null)
        {
            //set extra html array
            var stop_html = stop_data[2];
            var stop_spread = '0-0';
            if( typeof stop_data[6] != 'undefined' ) stop_spread = stop_data[6].replace(/\$/,"");
            
            var stop_spread_before = stop_spread.replace(/\-\d+/,"");
            var stop_spread_after = stop_spread.replace(/\d+\-/,"");
            
            var stop_time = this.scroll.delay_time;
            if( typeof stop_data[4] != 'undefined' ) stop_time = parseFloat(stop_data[4].replace(/\$/,""));
            this.scroll.html_data[i] = {html:this.data.vars[stop_html], delay:stop_time, spread_before:stop_spread_before, spread_after:stop_spread_after};
        }
        
        /* debug log */
        if(this.debug == true) console.log('text_' + i + ': •' + elm + '• // time-multi: ' + multip + ' // time: ' + Math.floor(elm.replace(/[^A-Za-z0-9]/gi, "").length * data.ms_per_letter * multip) + 'ms');
        if(stop_data != null && this.debug == true) console.log(stop_data);
    }
    
    if(this.debug == true) console.log(this.scroll.html_data);
    
    var elements = document.getElementById(this.data.id).children;
    
    for( var i = 0; i < elements.length; i++ )
    {
        elements[i].setAttribute('style', 'opacity:0; transition: all '+ this.scroll_tranz +'ms ease-in;');
    }
    
    elements[0].style.opacity = '1';
    var len = elements[0].innerHTML.replace(/[^A-Za-z0-9]/gi, "").length;
    var time = Math.ceil(len * data.ms_per_letter * this.time_multi_arr[0]);
    if( time < data.min_ms_per_show ) time = data.min_ms_per_show;
    
    this.scroll.scroll_multi = this.time_multi_arr;
    this.scroll.scroll_text = this.words;
    
    if(this.debug == true) console.log(this);
    if(this.debug == true) console.log(this.scroll); //scroll data

    if(this.prod_start == true) this.initiate_scroller(this.scroll);
    else
    {

        elements[0].setAttribute('style', 'opacity:0; transition: all '+ this.scroll_tranz +'ms ease-in;');
        elements[elements.length-1].setAttribute('style', 'opacity:1; transition: all '+ this.scroll_tranz +'ms ease-in;');
        document.getElementsByClassName('banner')[0].setAttribute('class','banner no-fade');
    }
}

Machine_gun.prototype.brake_bones = function(main_string)
{
    var changed_string = this.make_holes(main_string);
    var words = changed_string.replace(/\/#/g,'§');
    var new_words = words.split(/\s?#\s?/);
    for( var i = 0; i < new_words.length; i++ )
    {
        new_words[i] = new_words[i].replace(/[§]+/g,'#');
    }
    return new_words;
}

Machine_gun.prototype.make_holes = function(my_string)
{
    var var_string = my_string.match(/{\$([A-Za-z0-9_]+)}/);
    if( var_string != null )
    {
        if( this.data.vars[var_string[1]] ) var new_string = my_string.replace(var_string[0], this.data.vars[var_string[1]]);
        else var new_string = my_string.replace(var_string[0], this.data.no_data);
        return this.make_holes(new_string);
    }
    else 
    {
        return my_string;
    }
}

Machine_gun.prototype.initiate_scroller = function(data)
{
    clearInterval(this.timer);
    var _this = this;
    
    if(data.scroll_enable == true)
    {
        document.getElementById(this.scroll.id).innerHTML = '<div><em></em></div><i></i>';
        this.scroll_container = document.getElementById(data.id);
        var width = this.scroll_container.offsetWidth;
        var scroll_elm = this.scroll_container.children[0];

        this.scroll_container.addEventListener('mousedown', function(){
            window.addEventListener('mousemove', _this.scroll_move);
            document.getElementById(_this.scroll.id).children[0].style.transition = '';
            _this.stop();
        });

        window.addEventListener('mouseup', function(){
            window.removeEventListener('mousemove', _this.scroll_move);
        });
       
        this.scroll_container.addEventListener('touchstart', function(){
            window.addEventListener('touchmove', _this.scroll_move);
            document.getElementById(_this.scroll.id).children[0].style.transition = '';
            if(_this.debug == true) console.log('touchstart');
            _this.stop();
        });

        window.addEventListener('touchend', function(){
            window.removeEventListener('touchmove', _this.scroll_move);
            if(_this.debug == true) console.log('touchend');
        });
    }
    else
    {
        var width = 150;
    }
    
    var quant = data.scroll_total/width;
    var text_container = document.getElementById(this.data.id);
    var elements = text_container.children;
    
    var n = 0;
    var k = 0; //count
    
    this.timer = setInterval(function(){
        if(n == width - 1) k++;
        
        if(k >= data.scroll_max && data.scroll_max != 0)
        {    
           _this.end(data, elements, quant);
        }
        else
        {   
            if (n < width) n++;
            else n = 0;
            
            if(n == 1 && data.scroll_enable == true) if( k >= _this.show_scroll_after ) document.getElementById(_this.scroll.id).style.opacity = 1;
            
            if(data.scroll_enable == true) scroll_elm.setAttribute('style','width:'+n+'px');

            var time_location = n*quant;
            _this.change_text(time_location, data, elements);
            
            if(_this.debug == true &&  n == 1)  console.log('run: ' + (k+1) + ' of ' + data.scroll_max);
        }
    },quant);
}

Machine_gun.prototype.stop = function()
{
    clearInterval(this.timer);
}

Machine_gun.prototype.change_text = function(time_location, data, elements)
{
    var elm_length = elements.length;
    if(typeof this.add_data != 'undefined' )
    {
        clearTimeout(this.add_data);
    }
    for( var i = 0; i < elm_length; i++ )
    {
        if(time_location >= data.scroll_start[i] && time_location <= data.scroll_end[i] )
        {
            elements[i].style.opacity = 1;
            elements[i].style.zIndex = 10;
            var animation = this.data.animation_type;
            if(eval("this.data.animation_exceptions.exception_frame_" + i)) animation = eval("this.data.animation_exceptions.exception_frame_" + i);
            elements[i].setAttribute('class', animation );
            this.data_delay(data, elements, i);
        }
        else
        {
            elements[i].removeAttribute('class');
            elements[i].style.opacity = 0;
            elements[i].style.zIndex = 0;
        }
    }
}

Machine_gun.prototype.scroll_move = function(e)
{
    var data = [];
    if(_this.debug == true) console.log(e.layerX, e.clientX, e.target, e);
    data.div = document.getElementById(_this.scroll.id).children[0];
    data.parent = document.getElementById(_this.scroll.id);
    data.scroll_position = data.div.offsetLeft;
    data.par_width = data.parent.offsetWidth;
    data.page_position = document.getElementById(_this.scroll.id).parentElement.offsetLeft;
    data.page_position += document.getElementById(_this.scroll.id).offsetLeft;
    data.scroll_time = _this.scroll.scroll_total;
    data.quant = data.scroll_time/data.par_width;
    data.location = Math.floor(data.scroll_time/data.par_width*data.scroll_position);
    
    var x_shift  = 0;
    if( typeof e.clientX == 'undefined' ) x_shift = e.layerX;
    else x_shift = e.clientX - data.page_position;
    
    data.scroll_location = Math.floor(x_shift*data.quant);
    
    if(data.scroll_location < 1) data.scroll_location = 1;
    if(data.scroll_location > data.scroll_time - 1) data.scroll_location = data.scroll_time - 1;
    
    data.div.style.width = Math.floor(data.scroll_location/data.quant);
    
    if(_this.debug == true) console.log(data);
    _this.change_text(data.scroll_location, _this.scroll, document.getElementById(_this.data.id).children);
}

Machine_gun.prototype.data_delay = function(data, elements, i)
{   
    if(typeof data.html_data[i] != 'undefined')
    {
        var this_elm = elements[i];
        
        var max = data.html_data[i].spread_after;
        var min = data.html_data[i].spread_before;
        
        var html = data.html_data[i].html;

        this.add_data = setTimeout(function(){

            if(_this.debug == true) console.log(this_elm, html);
            var n = 0;
            var first = 0;
            var last = 0;
            var time = 0;
            var time_start = 0;
            var time_end = 0;
            
            for( var m = min*(-1); m <= max; m++ )
            {
                var nom = i + m;
                last = nom;
                time += data.scroll_time[nom];
                elements[nom].style.opacity = 0;
                elements[nom].style.zIndex = 0;
                if(n == 0)
                {
                    first = nom;
                    time_start = data.scroll_start[nom];
                    n++;
                }
                
                time_end = data.scroll_end[nom];
                
                delete data.scroll_start[nom];
                delete data.scroll_end[nom];
                delete data.scroll_time[nom];
                
                if(_this.debug == true && nom == i) console.log('new odd added');
            }
            
            data.scroll_start[first] = time_start;
            data.scroll_end[first] = time_end;
            data.scroll_time[first] = time;
            elements[first].innerHTML = data.html_data[i].html;
            elements[first].style.opacity = 1;
            elements[first].style.zIndex = 10;
            
            if(_this.debug == true) console.log(time_start, time_end, time, data.html_data[i].html);
            
            _this.exit();
            delete data.html_data[i];
            
        },Math.floor(data.html_data[i].delay * 1000));
    }
}

Machine_gun.prototype.end = function(data, elements, quant)
{
    for( var i = 0; i < elements.length; i++ )
    {
        elements[i].setAttribute('style', 'opacity:0; transition: all 0ms ease-in;');
    }
    
    var last_elm_nr = elements.length - 1;
    var stop_elm_nr = this.scroll.scroll_end_stop-1;
    var scrl_loc = this.scroll.scroll_start[stop_elm_nr] + 1;
    
    if(data.scroll_enable == true)
    {
        document.getElementById(this.scroll.id).style.opacity = 1;
        document.getElementById(this.scroll.id).children[0].style.transition = 'all ' + this.back_time + 'ms ease-out';
        document.getElementById(this.scroll.id).children[0].style.width = Math.floor(scrl_loc/quant);
    }
    
    var last_show = elements[stop_elm_nr];
    var diff = this.back_time / (last_elm_nr - stop_elm_nr);
    
    if(this.debug == true) console.log(stop_elm_nr, last_elm_nr, diff);
    
    this.back_loop(data, elements, quant, stop_elm_nr, last_elm_nr, diff);

    if(this.debug == true) console.log('stop on: ' + (stop_elm_nr) + '(' + scrl_loc + ')');
    this.stop();
}

Machine_gun.prototype.back_loop = function(data, elements, quant, stop_elm_nr, last_elm_nr, diff)
{
    if( last_elm_nr > stop_elm_nr )
    {
        var final_loop = setTimeout(function(){
            if(_this.debug == true) console.log('show: ' + last_elm_nr);
            elements[last_elm_nr].style.opacity = 0;
            elements[last_elm_nr].style.zIndex = 0;
            elements[last_elm_nr-1].style.opacity = 1;
            elements[last_elm_nr-1].style.zIndex = 10;
            
            _this.back_loop(data, elements, quant, stop_elm_nr, last_elm_nr-1, diff);
        }, diff);
    }
    else
    {
        elements[last_elm_nr].style.opacity = 1;
        this.data_delay(data, elements, stop_elm_nr);
        if(this.debug == true) console.log('scroll end');
    }
}

Machine_gun.prototype.exit = function()
{
    var len = document.getElementsByClassName('odds').length;
    
    for( var i = 0; i < len; i++ )
    {
        document.getElementsByClassName('odds')[i].addEventListener("click",function(){
            window.open('bwin.html', '_self');
        });
    }
}
