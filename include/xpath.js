                //trim - match spaces at beginning and end of text and replace with null string
                //also example of extending functionality of intrinsic object in JavaScript
                String.prototype.trim = function() {
                        return this.replace(/^\s+/,'').replace(/\s+$/,'');
                }

                // Prevent ugly dotted border on anchor mouse down
                function RemoveDot()
                {
                        for (a in document.links)
                                document.links[a].onfocus = document.links[a].blur;
                }
                if (document.all)
                        document.onmousedown = RemoveDot;

                // Initialize the DOM (global object)
                var xmldoc = Sarissa.getDomDocument();

                // show details for a single term
                function showSingle(id)
                {
                        document.getElementById("termancestry").innerHTML = getAncestry(id, xmldoc);
                        document.getElementById("termscopenote").innerHTML = getSN(id, xmldoc);
                }

                function doFind()
                {
                        var s = document.getElementById("searchstring").value;
                        s = s.toLowerCase();
                        var startsWith = true;
                        if(document.getElementById("searchcriteria").value=="contains")
                                startsWith = false;
                        document.getElementById("searchresult").innerHTML = findTerms(s, startsWith, xmldoc);
                        if(document.getElementById("searchresult").innerHTML == "")
                                document.getElementById("recordcount").innerHTML = "(0 términos)";
                }

// Get composite scope note (includes PT, RTs, definition, SN, UFs)
// Builds the following html string for display purposes:
// <div>
//        <span class='pt'><b>The preferred term</b></span>
//        (See also: <span class='rt'><a href='javascript:showSingle(term id)')>a related term</a></span>)
//        <p>The definition for the term, where it exists</p>
//        <p>The scope note for the term, where it exists</p>
//        <p>Use for: <span class='npt'>UF</span>,<span class='npt'>terms</span></p>
// </div>
function getSN(id, xmldoc)
{
        var s = "<div>";
        // Get the skos:Concept identified by id
        var n = xmldoc.selectSingleNode("//skos:Concept[@rdf:about='" + id + "']");
        if(n != null)
        {
                // Get the preferred label for the term
                var n1 = n.selectSingleNode("skos:prefLabel/text()");
                if(n1 != null)
                        s += "<span class='pt'><b>" + n1.nodeValue + "</b></span>&nbsp;";
                // Get the related terms if they exist
                n1 = xmldoc.selectNodes("//skos:Concept[skos:related/@rdf:resource='" + id + "']");
                if(n1.length > 0)
                {
                        s += "<br/>Véase además:";
                        for(var i = 0; i < n1.length; i++)
                        {
                                var q = n1[i];
                                var x = q.selectSingleNode("skos:prefLabel/text()");
                                if(x != null)
                                        s += "<span class='rt'><a href='javascript:showSingle(\"" + q.attributes.getNamedItem("rdf:about").value + "\")'>" + x.nodeValue + "</a></span>, ";
                        }
                        // Remove last comma and close bracket
                        s = s.substr(0,s.length-2) + ".";
                }

                // Add the definition if one exists
                n1 = n.selectSingleNode("skos:definition/text()");
                if(n1 != null)
                        s += "<p>" + n1.nodeValue + "</p>";

                // Add the scope note if one exists
                n1 = n.selectSingleNode("skos:scopeNote/text()");
                if(n1 != null)
                        s += "<p>" + n1.nodeValue + "</p>";

                // Add the note if one exists
                n1 = n.selectSingleNode("skos:note/text()");
                if(n1 != null)
                        s += "<p>" + n1.nodeValue + "</p>";

                // Add UF terms if they exist
                n1 = n.selectNodes("skos:altLabel/text()");
                if(n1.length > 0)
                {
                        s += "<p>Usado por:&nbsp;";
                        for(var i = 0; i < n1.length; i++)
                        {
                                var x = n1[i];
                                if(x != null)
                                        s += " <span class='npt'>" + x.nodeValue + "</span>,";
                        }
                        // Remove last comma
                        s = s.substr(0,s.length-1);
                        s += "</p>";
                }
        }

        s += "</div>";
        return s;
}
// Get composite hierarchical tree of links
// Builds the following html string for display purposes:
// <div>

// </div>
function getAncestry(id, xmldoc)
{
        var s = "";
        var i = 0; //use to prevent getting locked into infinite loop

        var n = xmldoc.selectSingleNode("//skos:Concept[@rdf:about='" + id + "']");
        while(n != null)
        {
                var x = n.selectSingleNode("skos:prefLabel/text()")
                if(x != null)
                {
                        if(n.attributes.getNamedItem("rdf:about").value == id)
                        {
                                s = "<div class='pt'><b>" + x.nodeValue + "</b>" + getNT(id, xmldoc) + "</div>";
                                //s = s + getSiblings(id, xmldoc); //works, but sometimes too much info??
                        }
                        else
                                s = "<div class='pt'><a href='javascript:showSingle(\"" + n.attributes.getNamedItem("rdf:about").value + "\")'>" + x.nodeValue + "</a>" + s + "</div>";
                }
                n = xmldoc.selectSingleNode("//skos:Concept[skos:narrower/@rdf:resource='" + n.attributes.getNamedItem("rdf:about").value + "']");
                i++;
                if (i==50)
                        return(-1);
        }
        return(s);
}

function getNT(id, xmldoc)
{
        var s = "";
        var i = 0;

        var n = xmldoc.selectNodes("//skos:Concept[skos:broader/@rdf:resource='" + id + "']");
        for(var i = 0; i < n.length; i++)
        {
                var q = n[i];
                var x = q.selectSingleNode("skos:prefLabel/text()");
                if(x != null)
                        s = s + "<div class='pt'><a href='javascript:showSingle(\"" + q.attributes.getNamedItem("rdf:about").value + "\")'>" + x.nodeValue + "</a></div>";
        }
        return(s);
}

function getSiblings(id, xmldoc)
{
        var s = "";
        var i = 0;

        var bt = xmldoc.selectSingleNode("//skos:Concept[skos:narrower/@rdf:resource='" + id + "']");

        var n = xmldoc.selectNodes("//skos:Concept[skos:broader/@rdf:resource='" + bt.attributes.getNamedItem("rdf:about").value + "']");
        for(var i = 0; i < n.length; i++)
        {
                var q = n[i];
                var x = q.selectSingleNode("skos:prefLabel/text()");
                if(x != null)
                {
                        if(q.attributes.getNamedItem("rdf:about").value == id)
                                s = s + "<div class='pt' style='color:blue'><b>" + x.nodeValue + "</b>aaa" + getNT(id) + "</div>";
                                
                        else
                                s = s + "<div class='pt'><a href='javascript:showSingle(\"" + q.attributes.getNamedItem("rdf:about").value + "\")'>bbb" + x.nodeValue + "</a></div>";
                }
        }
        return(s);
}

// Load chosen thesaurus into the DOM
function loadData(source_file)
{
        // Display the currently loaded thesaurus
        document.getElementById("currentThesaurus").innerHTML = "Cargando el archivo...";

        //Get the URL for the currently selected SKOS thesaurus file
        var dataset = "";
        var URL=source_file;
        var t = document.getElementById("thesaurus");
        if(t != null)
                dataset = t.options[t.selectedIndex].value;

        // Some currently unexplained errors prevented me from loading these
        // files via a URL, so temporarily copied them to local directory for
        // demonstration purposes. Will have to revisit this issue later.
        // [URL="http://isegserv.itd.rl.ac.uk/skos/gcl/gcl2.1.rdf";]
        // [URL="http://isegserv.itd.rl.ac.uk/skos/apais/apais200404.rdf";]

        // Display the currently loaded thesaurus
        document.getElementById("currentThesaurus").innerHTML = "<h1>Cargando el archivo...</h1>";

        try{
        //Load the applicable SKOS data set
        xmldoc = null;
        xmldoc = Sarissa.getDomDocument();
        xmldoc.async=false;
        xmldoc.load(URL);
        if(xmldoc.parseError != 0){
                document.getElementById("currentThesaurus").innerHTML = "<h1>No se pudo cargar el archivo.</h1>";
                alert(Sarissa.getParseErrorText(xmldoc));
        }
        else {
                document.getElementById("instruction").innerHTML = "Seleccione criterio de búsqueda";
        }

        // the following two lines are needed for IE - specifying namespace prefixes
        xmldoc.setProperty("SelectionNamespaces", "xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' xmlns:rdfs='http://www.w3.org/2000/01/rdf-schema#' xmlns:skos='http://www.w3.org/2004/02/skos/core#'");
        xmldoc.setProperty("SelectionLanguage", "XPath");

        // the following line appears to be needed for IE AND Mozilla FireFox
        //Sarissa.setXpathNamespaces(xmldoc, "xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' xmlns:rdfs='http://www.w3.org/2000/01/rdf-schema#' xmlns:skos='http://www.w3.org/2004/02/skos/core#'");

        // Display dc:title for currently loaded thesaurus
        var n = xmldoc.selectSingleNode("//skos:ConceptScheme/dc:title/text()");
        if(n != null)
                document.getElementById("currentThesaurus").innerHTML = "  " + n.nodeValue;
        }catch(e){
                document.getElementById("currentThesaurus").innerHTML = "NO se pudo cargar el archivo";
                alert(e);
        }

        // Display dc:Autohr for currently loaded thesaurus
        //~ var n = xmldoc.selectSingleNode("//skos:ConceptScheme/dc:creator/text()");
        if(n != null)
                document.getElementById("currentThesaurusAutor").innerHTML =  n.nodeValue;
}



// highlight all instances of s2 in s1 using recursion
function hilite(s1, s2)
{
        var s = "";
        var pos = s1.toLowerCase().indexOf(s2);

        if(pos >= 0)
        {
                s = s + s1.substr(0, pos);
                s = s + "<span class='hilite'>" + s2 + "</span>";
                s = s + hilite(s1.substring(pos + s2.length),s2);
        }
        else s = s1;
        return(s);
}

//Find matching terms
function findTerms(findWhat, startsWith, xmldoc)
{
        // Don't proceed without valid DOM or search string
        if(xmldoc == null || findWhat == null || findWhat.length == 0 )
                return(null);

        //find nodes containing the search string and return them
        //case sensitive match:
        //if(document.getElementById("matchcase").checked == true)
        //        var n = xmldoc.selectNodes("//node[contains(child::text(),'" + s + "')]");

        //Perform case insensitive match on prefLabel and altLabel fields
        var Upper2Lower = "'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'";

        //temp - to track down namespace problem
        //var Labels = xmldoc.selectNodes("//skos:prefLabel");
        //alert(Labels.length);

        if(startsWith == true)
        {
                var leyendaBusqueda=' comienzan con ';
                var Labels = xmldoc.selectNodes("//skos:prefLabel[starts-with(translate(text()," + Upper2Lower + "),'" + findWhat + "')] | //skos:altLabel[starts-with(translate(text()," + Upper2Lower + "),'" + findWhat + "')]");
        }
        else //contains
        {
                var leyendaBusqueda=' que contienen ';
                var Labels = xmldoc.selectNodes("//skos:prefLabel[contains(translate(text()," +
                Upper2Lower + "),'" + findWhat + "')] | //skos:altLabel[contains(translate(text()," +
                Upper2Lower + "),'" + findWhat + "')]");

        }
        //No match found??
        if(Labels == null | Labels.length == 0)
                return("");
        else //Match found
        {
                var a = new Array(Labels.length); //Declare array for sorting later

                for(var i = 0; i < Labels.length; i++)
                {
                        var n = Labels[i];
                        var x = n.selectSingleNode("text()");
                        var s = "";
                        //colour coding of matching text within displayed term..
                        var term = "";
                        if(startsWith == false)
                                term = hilite(x.nodeValue, findWhat);
                        else
                                term = x.nodeValue;

                        //Create invisible prefix used for sorting the displayed terms
                        var lcaseterm = x.nodeValue;
                        lcaseterm = lcaseterm.toLowerCase();
                        s += "<span style='display:none'>" + lcaseterm + '</span>';


                        //get preferred term for altLabel match
                        if(n.nodeName == "skos:altLabel")
                        {
                                n1 = n.parentNode.selectSingleNode("skos:prefLabel/text()");
                                if(n1 != null)
                                {
                                        s += term + " --&gt; USE "; // + n1.text;
                                        term = n1.nodeValue;
                                }
                        }


                        if(n.parentNode.attributes.getNamedItem("rdf:about"))
                        {
                                //create an anchor pointing to the preferred term
                                s = s + "<a href='javascript:showSingle(&quot;" + n.parentNode.attributes.getNamedItem("rdf:about").value + "&quot;)'>";
                                s = s + term.trim() + " </a>";
                        }
                        //Add item to the array
                        a[i] = s;
                }
                //Build string from sorted array
                a.sort();
                s = a.join("<br />");

                //Display the count

                document.getElementById("recordcount").innerHTML = "<h3>" + Labels.length + " términos " + leyendaBusqueda + " \"<i>"+ findWhat +"</i>\"</h3>";
        }
        return(s);
}

