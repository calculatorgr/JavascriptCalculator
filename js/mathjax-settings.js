MathJax.Hub.Config({
    showProcessingMessages: "false",
    messageStyle: "none",
    displayAlign: "center",
    showMathMenu: false,
    showMathMenuMSIE: false,
 
    menuSettings: {
        zoom: "None",
        CTRL: true,
        ALT: false,
        CMD: false,
        Shift: false,
        zscale: "200%",
        font: "Auto",
        context: "MathJax",
        mpContext: false,
        mpMouse: false,
        texHints: true
    },

    "HTML-CSS": {
        scale: 160,
        minScaleAdjust: 100,
        styles: {
            ".MathJax": {
             color: "#87bdd8"
            },
            ".MathJax .mo": {
                color: "#e3eaa7"
            },
            ".MathJax .mi": {
                color: "#b5e7a0"
            },
            ".MathJax .mn": {
                color: "#c8c3cc"
            }
        },
        linebreaks: {
            automatic: true
        }
    },
    asciimath2jax: {
        delimiters: [
            ['$$', '$$'],
            ['`', '`']
        ]
    },
    tex2jax: {
        inlineMath: [
            ['$$', '$$'],
            ['`', '`']
        ],
        processEscapes: true
    }
});
/*MathJax.Hub.Register.StartupHook("HTML-CSS Jax Ready", function() {
 var VARIANT = MathJax.OutputJax["HTML-CSS"].FONTDATA.VARIANT;
 VARIANT["normal"].fonts.unshift("MathJax_SansSerif");
 VARIANT["bold"].fonts.unshift("MathJax_SansSerif-bold");
 VARIANT["italic"].fonts.unshift("MathJax_SansSerif-italic");
 VARIANT["-tex-mathit"].fonts.unshift("MathJax_SansSerif-italic");
});
MathJax.Hub.Register.StartupHook("SVG Jax Ready", function() {
 var VARIANT = MathJax.OutputJax.SVG.FONTDATA.VARIANT;
 VARIANT["normal"].fonts.unshift("MathJax_SansSerif");
 VARIANT["bold"].fonts.unshift("MathJax_SansSerif-bold");
 VARIANT["italic"].fonts.unshift("MathJax_SansSerif-italic");
 VARIANT["-tex-mathit"].fonts.unshift("MathJax_SansSerif-italic");
})*/
