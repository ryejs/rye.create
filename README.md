rye.create
==========

**rye.create** is a framework-agnostic zen-coding-like interface for creating DOM elements.

## Usage

Just include `rye.create.js` in your page. It will export itself using requirejs/AMD, to a global `$` variable or to `window.create` if `$` is not defined.

Calls to `create()` return instances of `DocumentFragment`:

    var fragment = $.create('section > p + div.places > li*5 > a[href=#$]')

Resulting in this DOM structure:

    <section>
        <p></p>
        <div class="places">
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
        </div>
    </section>

Calling `fragment.toHTML()` returns an HTML string representing it's contents.