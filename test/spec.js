var _slice = Array.prototype.slice

function pad (n, ln){
    var n = n.toString()
    while (n.length < ln) n = '0' + n
    return n
}

test('creates document fragment', function(){
    var frag = $.create('div')
    assert.instanceOf(frag, DocumentFragment)
})

test('tag', function(){
    var div = $.create('div').firstChild
    assert.instanceOf(div, Element)
    assert.equal(div.tagName.toLowerCase(), 'div')
})

test('id', function(){
    var div = $.create('div#test').firstChild
    assert.instanceOf(div, Element)
    assert.equal(div.id, 'test')
})

test('multiple ids', function(){
    var div2 = $.create('div#one#two').firstChild
    assert.instanceOf(div2, Element)
    assert.equal(div2.id, 'two', 'last definition is used')
})

test('class', function(){
    var div = $.create('div.test').firstChild
    assert.instanceOf(div, Element)
    assert.equal(div.className, 'test')
})

test('multiple classes', function(){
    var div = $.create('div.one.two.three.four-five_six').firstChild
    assert.instanceOf(div, Element)
    assert.equal(div.className, 'one two three four-five_six')
})

test('id + classes', function(){
    var div = $.create('div#hey.one.two.three').firstChild
    assert.instanceOf(div, Element)
    assert.equal(div.id, 'hey')
    assert.equal(div.className, 'one two three')
})

test('id + classes interleaved', function(){
    var div2 = $.create('div.one.two#hey.three').firstChild
    assert.instanceOf(div2, Element)
    assert.equal(div2.id, 'hey')
    assert.equal(div2.className, 'one two three')
})

test('attributes', function(){
    var div = $.create('div[title="hello",data-bacon=1]').firstChild
    assert.equal(div.getAttribute('title'), 'hello')
    assert.equal(div.getAttribute('data-bacon'), 1)
})

test('attributes with spaces', function(){
    var div = $.create('div[title=" hello  world ",data-bacon=1]').firstChild
    assert.equal(div.getAttribute('title'), 'hello  world', 'string is trimmed')
    assert.equal(div.getAttribute('data-bacon'), 1)
})

test('attributes ignore extraneous spaces', function(){
    var div = $.create('div[title = "hello you" ,data-bacon= 1]').firstChild
    assert.equal(div.getAttribute('title'), 'hello you')
    assert.equal(div.getAttribute('data-bacon'), 1)
})

test('empty attributes', function(){
    var div = $.create('div[title]').firstChild
    assert.equal(div.getAttribute('title'), '')
})

test('repetition', function(){
    var frag = $.create('li*3')
      , items = frag.childNodes

    assert.lengthOf(items, 3)
    assert.equal(items[0].tagName.toLowerCase(), 'li')
})

suite('operators', function(){

    test('>', function(){
        var frag = $.create('div > p > span')
        assert.lengthOf(frag.querySelector('div').childNodes, 1)
        assert.equal(frag.querySelector('div p').tagName.toLowerCase(), 'p')
        assert.equal(frag.querySelector('div span').tagName.toLowerCase(), 'span')
    })

    test('+', function(){
        var frag = $.create('div + p')
        assert.lengthOf(frag.querySelector('div').childNodes, 0)
        assert.equal(frag.querySelector('div + p').tagName.toLowerCase(), 'p')
    })

})

suite('features', function(){

    test('numbering', function(){
        var lis = $.create('li.n$#l$*5').childNodes
        assert.lengthOf(lis, 5)
        _slice.call(lis).forEach(function(li, i){
            assert.equal(li.className, 'n' + (i+1))
            assert.equal(li.id, 'l' + (i+1))
        })
    })

    test('numbering with padding', function(){
        var lis = $.create('li.n$$#l$$$$*27').childNodes
        assert.lengthOf(lis, 27)
        _slice.call(lis).forEach(function(li, i){
            assert.equal(li.className, 'n' + pad(i+1, 2))
            assert.equal(li.id, 'l' + pad(i+1, 4))
        })
    })

    test('numbering inherited from parent when single element', function(){
        var ps = $.create('li*5 > p.n$').querySelectorAll('p')
        assert.lengthOf(ps, 5)
        _slice.call(ps).forEach(function(p, i){
            assert.equal(p.className, 'n' + (i+1))
        })
    })

    test('text', function(){
        var div = $.create('div{hello}').firstChild
        assert.equal(div.tagName.toLowerCase(), 'div')
        assert.equal(div.textContent, 'hello')
    })

    test('text replacement', function(){
        var div = $.create('div{hello $x$y}', { x: 'world', y: '!' }).firstChild
        assert.equal(div.tagName.toLowerCase(), 'div')
        assert.equal(div.textContent, 'hello world!')
    })

    test('text with siblings', function(){
        var div = $.create('div{hello}>p*2').firstChild
          , text = div.firstChild
        assert.ok(text)
        assert.equal(text.nodeType, 3)
        assert.equal(text.textContent, 'hello')
        assert.equal(div.querySelectorAll('p').length, 2)
    })

    test('toHTML', function(){
        var html = $.create('div').toHTML()
        assert.equal(html.toLowerCase(), '<div></div>')
    })

    test('toHTML complex', function(){
        var html = $.create('ul#oi > li.x*2 > a').toHTML()
        assert.equal(html.toLowerCase(), '<ul id="oi"><li class="x"><a></a></li><li class="x"><a></a></li></ul>')
    })

    test('toHTML preserves fragment contents', function(){
        var frag = $.create('div'), html
        frag.toHTML()
        html = frag.toHTML()
        assert.equal(html.toLowerCase(), '<div></div>')
    })

})

suite('samples', function(){

    test('list', function(){
        var frag = $.create('div{hello}#main>ul.list.bacon#bacon > li.hello$*4 > a[href=#$]{hello $x}', { x: 'world' })
        assert.equal(frag.toHTML(), '' +
            '<div id="main">' +
                'hello' +
                '<ul id="bacon" class="list bacon">' +
                    '<li class="hello1"><a href="#1">hello world</a></li>' +
                    '<li class="hello2"><a href="#2">hello world</a></li>' +
                    '<li class="hello3"><a href="#3">hello world</a></li>' +
                    '<li class="hello4"><a href="#4">hello world</a></li>' +
                '</ul>' +
            '</div>'
        )
    })

    test('section +', function(){
        var frag = $.create('section > p + div.places > li*5')
        assert.equal(frag.toHTML(), '' +
            '<section>' +
                '<p></p>' +
                '<div class="places">' +
                    '<li></li>' +
                    '<li></li>' +
                    '<li></li>' +
                    '<li></li>' +
                    '<li></li>' +
                '</div>' +
            '</section>'
        )
    })

})

// Tests imported from emmet
suite('emmet', function(){

    function compare(abbreviation, expanded){
        var html = $.create(abbreviation).toHTML()
        assert.equal(html, expanded)
    }

    test("'+' operator", function() {
        compare('p+p', '<p></p><p></p>')
        compare('p.name+p+p', '<p class="name"></p><p></p><p></p>')
    })

    test("'>' operator", function() {
        compare('p>em', '<p><em></em></p>')
        compare('p.hello>em.world>span', '<p class="hello"><em class="world"><span></span></em></p>')
    })

    test('attributes', function(){
        compare('span[title]', '<span title=""></span>')
        compare('span[title data]', '<span title="" data=""></span>')
        compare('span.test[title data]', '<span class="test" title="" data=""></span>')
        compare('span#one.two[title data]', '<span id="one" class="two" title="" data=""></span>')
        compare('span[title=Hello]', '<span title="Hello"></span>')
        compare('span[title="Hello world"]', '<span title="Hello world"></span>')
        compare('span[title=\'Hello world\']', '<span title="Hello world"></span>')
        compare('span[title="Hello world",data=other]', '<span title="Hello world" data="other"></span>')
        compare('span[title="Hello world",data=other,attr2,attr3]', '<span title="Hello world" data="other" attr2="" attr3=""></span>')
        compare('span[title="Hello world",data=other,attr2,attr3]>em', '<span title="Hello world" data="other" attr2="" attr3=""><em></em></span>')
        compare('filelist[id=javascript.files]', '<filelist id="javascript.files"></filelist>')
    })

})