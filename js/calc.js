var expr = document.getElementById('expr'),
pretty = document.getElementById('pretty'),
result = document.getElementById('result'),
angles_units = ['rad', 'deg', 'grad'],
angles_unit_index = 0,
exampleIndx = Math.floor(Math.random()*examples.length),
noNeedResult = ['function','undefined','Stop'],
noNeedPretty = ['b2b'];

expr.value = "";
pretty.innerHTML = "<span style='color:#57637c;'>$$$$</span>";
result.value = ""; //.innerHTML(use with div)

var noNeedResultRegex = new RegExp(noNeedResult.map(function(w){ return '\\b'+w+'\\b' }).join('|'),'i');

var noNeedPrettyRegex = new RegExp(noNeedPretty.map(function(w){ return '\\b'+w+'\\b' }).join('|'));
function needPretty(expr)
{
    return !noNeedPrettyRegex.test(expr);  //expr.search(noNeedPrettyRegex)<0;
}

function display(to_autoexec)
{
    var exprValue="",
        node = null,
        node2 = null,
        node3 = null,
        latex = "",
        latex2 = "",
        the_result = "",
        need_pretty = true;

    exprValue = expr.value.replace(/÷/g, '/');
    need_pretty = needPretty(exprValue);
    try {
        // parse the expression
        node = math.parse(exprValue);        
        // evaluate the result of the expression
        the_result = to_autoexec ? math.format(node.compile().eval(), {lowerExp: -10, upperExp: 10}) : "" ;        
        result.value = (!to_autoexec || noNeedResultRegex.test(the_result)) ? "" : the_result.replace(/['"]+/g, '') ;   // .innerHTML(use with div)
    }
    catch (err) {
        result.value = ""; //.innerHTML(use for div)
    }    
    try {   
            if(need_pretty) {
                the_result = the_result.replace(/['"]+/g, '');
                exprValue = exprValue.replace(/['"]+/g, '');
            }                
            // parse the result
            node2 = result.value=="" ? "" : math.parse(the_result);
            // export the expression to LaTeX
            node3=math.parse(exprValue);
            latex = node3 ? node3.toTex({parenthesis: parenthesis, implicit: implicit}) : "";
            // export the result to LaTeX
            latex2 = (to_autoexec && node2) ? " = " + node2.toTex({parenthesis: parenthesis, implicit: implicit}) : ""; 
            // display and re-render the expression and result            
    }
    catch (err) {}
    var elem = MathJax.Hub.getAllJax('pretty')[0];
    MathJax.Hub.Queue(['Text', elem, (node==null || node=='undefined' ) ? "" : (latex+latex2).replace(/['"]+/g, '')]);
}


$(document).ready(function(){
        $("#expr").bind("input keyup cut paste",function(){
        display(autoexecution);
    }); 

    document.getElementById('basic').style.display = 'block';
    document.getElementById('fix').style.display = 'block'; 
    document.getElementById('basic-switch').className += " active"; 
    
    $(".switch:not('#toggleTooltip')").click(function(){ 
        this_id = $(this).attr('id');
        //this_class = $(this).attr('class');
        cat_id = $(this).attr('cat_id');

        if($('#'+cat_id).is(':visible') && cat_id != 'basic'){ 
            $('#'+cat_id).css('display','none');
            document.getElementById(this_id).classList.remove("active");
        }
        else{
            $('#'+cat_id).css('display','block');
            document.getElementById(this_id).className += " active";
        }        
        
        if(true)
        {
            $('.cat').each(function(){
                temp = $(this).attr('id');
                if( temp != 'fix' && temp != cat_id && temp != 'basic')
                {
                    $(this).css('display', 'none'); //attr('style', 'display:none');
                    document.getElementById(temp+'-switch').classList.remove("active"); 
                }
            });
            
            if(cat_id != 'basic' && $('#'+cat_id).is(':visible')){ 
                $('#basic').css('display',"none");
                document.getElementById('basic-switch').classList.remove("active");
            }
            else{
                $('#basic').css('display',"block");
                document.getElementById('basic-switch').className += !document.getElementById('basic-switch').classList.contains("active") ? " active" : "";
            }
        }
    });    
    
    $(".distr-funcname:not('.beta')").each(function(){
    temp_id = $(this).attr('id');
        $('#'+temp_id+'-div').css('display', 'none');
    });
    if(document.getElementById("betaDistr").classList.contains("active")==false) 
          document.getElementById("betaDistr").className += " active"; 
    $(".distr-name").click(function(){
        this_id = $(this).attr('id');
        this_obj = document.getElementById(this_id);
        this_distrname = this_id.replace('Distr','');
        if(this_obj.classList.contains("active"))
            return;
        $(".distr-name").each(function(){
            temp_id = $(this).attr('id');
            if(temp_id != this_id && document.getElementById(temp_id).classList.contains("active"))
            {
                document.getElementById(temp_id).classList.remove("active");
            }
        });
        if(!this_obj.classList.contains("active")) 
            this_obj.className += " active";
        $(".distr-funcname").each(function(){
            temp_id = $(this).attr('id');
            temp_obj = document.getElementById(temp_id);
            //temp_id = this_obj.getAttribute('func_name')+temp_obj.getAttribute('func_name');
            distrname = temp_id.replace(/Pdf|Cdf|Inv|Mean|Median|Mode|Sample|Var/g,'');
            if(distrname==this_distrname)
            {
                //temp_obj.setAttribute('display_on_screen', temp_id);
                //$(temp_obj).html(toDisplayOnButtons[temp_id]);
                $('#'+temp_id+'-div').css({'display':'block', 'color':'white'});
                if(typeof math[temp_id] != 'function')
                    $('#'+temp_id).css({'color':'gray', 'cursor':'default'});
                //temp_obj.prop('disabled', false);
                //$(temp_object).prev(temp_id).prop('id', temp_id);
                //$(temp_obj).prop('title', 'yes');
            }
            else
            {
                //temp_obj.setAttribute('display_on_screen', '');                
                $('#'+temp_id+'-div').css('display', 'none');
                //$('#'+temp_id).css({'color':'gray'});
                //$(temp_obj).html(temp_obj.getAttribute('func_name'));
                //temp_obj.prop('disabled', true);
            }
        });
    })
    
    $(".btn").click(function(){
        this_id = $(this).attr('id');
        switch (this_id)
        {
            case ''         : break;
            case 'goleft'   : goLeft(); break;
            case 'goright'  : goRight(); break;
            case 'delete'   : toggleDelete(); break;
            case 'allclear' : allClear('expr'); display(true); break;
            case 'execute'  : display(true); break;
            case 'angles'   : toggleAnglesUnit(this_id); break;
            case 'autoexec' : setAutoexec(this_id); break;
            case 'examples' : expr.value=examples[exampleIndx++ % examples.length]; display(autoexecution); break;
            default         : insertAtCursorAndDisplay($('#'+this_id).attr('display_on_screen'));
                              /*backToBasicCategory(this_id);*/
                              break;
        } 
    });
       
    $("#toggleTooltip").click(function(){
        var temp;
        $(".btn, .switch, .mobileversionlink, #toggleTooltip").each(function(){            
            temp = $(this).attr('title');
            $(this).attr('title', $(this).attr('temp_title'));
            $(this).attr('temp_title', temp);    
        });
        temp=document.getElementById('toggleTooltip');
        temp.classList.contains("active") ? temp.classList.remove("active") : temp.className += " active";        
    });
    
    var bc = new Base({
    Big: Big,
    extensions: [extRoman, extTwosComplement, extStandard, extLeet, extImaginary]
    });    
    window['b2b'] = function(from_base, to_base, the_number)
    {
        return bc.convert(from_base, to_base, the_number);
    }

});



/*expr.oninput = function () { display(); }*/
function insertAtCursorAndDisplay(value)
{
    insertAtCursorPosition('expr', value);
    display(autoexecution);
}

function toggleDelete()
{   
    var a = document.getElementById('goleft');
    var b = document.getElementById('goright');
            
    var x = a.getAttribute('title') != '' ? 'title' : 'temp_title';
    var temp = a.getAttribute(x);
    a.setAttribute(x, a.getAttribute('second_title'));
    a.setAttribute('second_title', temp);    
    temp = b.getAttribute(x);
    b.setAttribute(x, b.getAttribute('second_title'));
    b.setAttribute('second_title', temp);
   
    var a_val = a.innerHTML;
    var b_val = b.innerHTML;
    if(a_val.charAt(0) != 'x')
    {
        a.innerHTML = 'x' + a_val;
        b.innerHTML = b_val + 'x';
        //a.innerHTML = '&#9003;';
        //b.innerHTML = '&#8998;';
    }
    else
    {
        a.innerHTML = a_val.slice(1);
        b.innerHTML = b_val.slice(0,-1);
    }
    document.getElementById('expr').focus(); 
}
function goLeft()
{
    if(document.getElementById('goleft').innerHTML.charAt(0)=='x')
    {
        removePreviousChar('expr');
        display(autoexecution);
    }
    else
        moveCursorLeft('expr');
}
function goRight()
{
    if(document.getElementById('goleft').innerHTML.charAt(0)=='x') //without meaning since goleft and goright are changed at the same time
    {
        removeNextChar('expr');
        display(autoexecution);
    }
    else
        moveCursorRight('expr');
}
function toggleAnglesUnit(id)
{
    anglesConfig.toggleUnit();
    a = document.getElementById(id);
    a.innerHTML = anglesConfig.unit;
    temp = a.getAttribute('title');
    what_to_change = temp!='' ? 'title' : 'temp_title';    
    temp = a.getAttribute(what_to_change);
    a.setAttribute(what_to_change, anglesConfig.getDescr(anglesConfig.unit));
    if(autoexecution) 
        display(autoexecution); 
}
function setAutoexec(id)
{
    autoexecution = !autoexecution;
    a = document.getElementById(id);
    temp = a.getAttribute('title');
    what_to_change = temp!='' ? 'title' : 'temp_title';
    temp = a.getAttribute(what_to_change);
    a.setAttribute(what_to_change, a.getAttribute('second_title'));
    a.setAttribute('second_title', temp);
    autoexecution ? a.className += " active" : a.classList.remove("active");
    if(autoexecution) 
        display(autoexecution); 
}
function backToBasicCategory(btn_id)
{
    cat_id = $('#'+btn_id).attr('cat_id');
    if( cat_id != 'fix' && cat_id != 'basic')
    {
        $('#'+cat_id).css('display', 'none'); //attr('style', 'display:none');
        $('#basic').css('display', 'block');
    }
}

function displayHostName() {
    const link = document.getElementById("calcLogo-link");
    link.href = window.location.href;
    domain = window.location.host.replace('www.','');    
    var subdomain = 'www.';
    var subdomain_len = subdomain.length;
    if (domain.substr(subdomain, subdomain_len) == subdomain)
        domain = domain.substring(subdomain_len);
    domain = domain.toUpperCase();
    link.innerHTML = domain;
    
    const link2 = document.getElementById("pagelogo-link");
    link2.href = window.location.href;
    link2.innerHTML = domain;
}