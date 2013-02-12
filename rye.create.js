// Rye.create
// ----------

// Hello.

(function(name, deps, definition){
    if (typeof module !== 'undefined') module.exports = definition(require)
    else if (typeof define === 'function') define(name, deps, definition)
    else (window.$ || window)[name] = definition(function(name){ return window[name] })
})('create', [], function(require){

    var _slice = Array.prototype.slice

    var exp = {
        operators  : /[>+]/g
      , multiplier : /\*(\d+)$/
      , id         : /#[\w-$]+/g
      , tagname    : /^\w+/
      , classname  : /\.[\w-$]+/g
      , attributes : /\[([^\]]+)\]/g
      , values     : /([\w-]+)(\s*=\s*(['"]?)([^,\]]+)(\3))?/g
      , numbering  : /[$]+/g
      , text       : /\{(.+)\}/
    }

    // Converts a documentFragment element tree to an HTML string. When a documentFragment
    // is given to `.appendChild` it's *contents* are appended; we need to clone the
    // fragment so that it remains populated and can still be used afer a `toHTML` call.
    function toHTML () {
        var div = document.createElement('div')
        div.appendChild(this.cloneNode(true))
        return div.innerHTML
    }

    // Pads number `n` with `ln` zeroes.
    function pad (n, ln){
        var n = n.toString()
        while (n.length < ln) n = '0' + n
        return n
    }

    // Replaces ocurrences of '$' with the equivalent padded index.
    // `$$ == 01`, `$$$$ == 0001`
    function numbered (value, n) {
        return value.replace(exp.numbering, function(m){
            return pad(n + 1, m.length)
        })
    }

    // .create API
    // ----------

    function create (str, data) {

        // Start by splitting the string into it's descendants and creating
        // the fragment which will hold the result DOM tree.
        var parts = str.split(exp.operators).map(Function.prototype.call, String.prototype.trim)
          , tree = document.createDocumentFragment()
          , ops = new RegExp(exp.operators)
          , match

        // Create a DOM element.
        function Element(index, tag, id, className, text, attrs){
            var element = document.createElement(tag)

            if (id)        element.id = numbered(id, index)
            if (className) element.className = numbered(className, index)
            if (text)      element.appendChild(document.createTextNode(text))

            if (attrs) for (var key in attrs) {
                if (!attrs.hasOwnProperty(key)) continue
                element.setAttribute(key, numbered(attrs[key], index))
            }

            return element
        }

        // At first the documentFragment is the only parent.
        var parents = [tree]

        // Parsing
        // -------

        // Go over the abbreviations one level at a time, and process
        // corresponding element values
        parts.forEach(function(original, i){

            var part = original
              , op = (ops.exec(str) || [])[0]
              , count = 1
              , tag
              , id
              , classes
              , text
              , attrs = {}

            // #### Attributes
            // Attributes are parsed first then removed so that it takes precedence
            // over IDs and classNames for the `#.` characters.
            if (match = part.match(exp.attributes)) {
                var matched = match[match.length-1]
                while(match = exp.values.exec(matched)){
                    attrs[match[1]] = (match[4] || '').replace(/['"]/g, '').trim()
                }
                part = part.replace(exp.attributes, '')
            }

            // #### Multipliers
            if (match = part.match(exp.multiplier)) {
                var times = +match[1]
                if (times > 0) count = times
            }

            // #### IDs
            if (match = part.match(exp.id)) {
                id = match[match.length-1].substr(1)
            }

            // #### Tag names
            if (match = part.match(exp.tagname)) {
                tag = match[0]
            } else {
                tag = 'div'
            }

            // #### Class names
            if (match = part.match(exp.classname)) {
                classes = match.map(function(c){
                    return c.substr(1)
                }).join(' ')
            }

            // #### Text
            if (match = part.match(exp.text)) {
                text = match[1]
                if (data) {
                    text = text.replace(/\$(\w+)/g, function(m, key){
                        return data[key]
                    })
                }
            }
            
            // Insert `count` copies of the element per parent. If the current operator
            // is `+` we mark the elements to remove it from `parents` in the next iteration.
            _slice.call(parents, 0).forEach(function(parent, parentIndex){
                for (var index = 0; index < count; index++){
                    // Use parentIndex if this element has a count of 1
                    var _index = count > 1 ? index : parentIndex

                    var element = Element(_index, tag, id, classes, text, attrs)
                    if (op === '+') element._sibling = true

                    parent.appendChild(element)
                }
            })

            // If the next operator is '>' replace `parents` with their childNodes for the next iteration.
            if (op === '>') {
                parents = parents.reduce(function(p,c,i,a){
                    return p.concat(_slice.call(c.childNodes, 0).filter(function(el){
                        return el.nodeType === 1 && !el._sibling
                    }))
                }, [])
            }

        })

        // Augment the documentFragment with the `toHTML` method.
        tree.toHTML = toHTML

        return tree
    }

    // Export main method
    return create

});