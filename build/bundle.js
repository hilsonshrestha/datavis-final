
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.47.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Scrolly.svelte generated by Svelte v3.47.0 */
    const file$3 = "src/Scrolly.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			add_location(div, file$3, 80, 0, 1967);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[8](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[8](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Scrolly', slots, ['default']);
    	let { root = null } = $$props;
    	let { top = 0 } = $$props;
    	let { bottom = 0 } = $$props;
    	let { increments = 100 } = $$props;
    	let { value = undefined } = $$props;
    	const steps = [];
    	const threshold = [];
    	let nodes = [];
    	let intersectionObservers = [];
    	let container;

    	const update = () => {
    		if (!nodes.length) return;
    		nodes.forEach(createObserver);
    	};

    	const mostInView = () => {
    		let maxRatio = 0;
    		let maxIndex = 0;

    		for (let i = 0; i < steps.length; i++) {
    			if (steps[i] > maxRatio) {
    				maxRatio = steps[i];
    				maxIndex = i;
    			}
    		}

    		if (maxRatio > 0) $$invalidate(1, value = maxIndex); else $$invalidate(1, value = undefined);
    	};

    	const createObserver = (node, index) => {
    		const handleIntersect = e => {
    			e[0].isIntersecting;
    			const ratio = e[0].intersectionRatio;
    			steps[index] = ratio;
    			mostInView();
    		};

    		const marginTop = top ? top * -1 : 0;
    		const marginBottom = bottom ? bottom * -1 : 0;
    		const rootMargin = `${marginTop}px 0px ${marginBottom}px 0px`;
    		const options = { root, rootMargin, threshold };
    		if (intersectionObservers[index]) intersectionObservers[index].disconnect();
    		const io = new IntersectionObserver(handleIntersect, options);
    		io.observe(node);
    		intersectionObservers[index] = io;
    	};

    	onMount(() => {
    		for (let i = 0; i < increments + 1; i++) {
    			threshold.push(i / increments);
    		}

    		nodes = container.querySelectorAll(":scope > *");
    		update();
    	});

    	const writable_props = ['root', 'top', 'bottom', 'increments', 'value'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Scrolly> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			container = $$value;
    			$$invalidate(0, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('root' in $$props) $$invalidate(2, root = $$props.root);
    		if ('top' in $$props) $$invalidate(3, top = $$props.top);
    		if ('bottom' in $$props) $$invalidate(4, bottom = $$props.bottom);
    		if ('increments' in $$props) $$invalidate(5, increments = $$props.increments);
    		if ('value' in $$props) $$invalidate(1, value = $$props.value);
    		if ('$$scope' in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		root,
    		top,
    		bottom,
    		increments,
    		value,
    		steps,
    		threshold,
    		nodes,
    		intersectionObservers,
    		container,
    		update,
    		mostInView,
    		createObserver
    	});

    	$$self.$inject_state = $$props => {
    		if ('root' in $$props) $$invalidate(2, root = $$props.root);
    		if ('top' in $$props) $$invalidate(3, top = $$props.top);
    		if ('bottom' in $$props) $$invalidate(4, bottom = $$props.bottom);
    		if ('increments' in $$props) $$invalidate(5, increments = $$props.increments);
    		if ('value' in $$props) $$invalidate(1, value = $$props.value);
    		if ('nodes' in $$props) nodes = $$props.nodes;
    		if ('intersectionObservers' in $$props) intersectionObservers = $$props.intersectionObservers;
    		if ('container' in $$props) $$invalidate(0, container = $$props.container);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*top, bottom*/ 24) {
    			(update());
    		}
    	};

    	return [container, value, root, top, bottom, increments, $$scope, slots, div_binding];
    }

    class Scrolly extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			root: 2,
    			top: 3,
    			bottom: 4,
    			increments: 5,
    			value: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Scrolly",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get root() {
    		throw new Error("<Scrolly>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set root(value) {
    		throw new Error("<Scrolly>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get top() {
    		throw new Error("<Scrolly>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set top(value) {
    		throw new Error("<Scrolly>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bottom() {
    		throw new Error("<Scrolly>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bottom(value) {
    		throw new Error("<Scrolly>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get increments() {
    		throw new Error("<Scrolly>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set increments(value) {
    		throw new Error("<Scrolly>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Scrolly>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Scrolly>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function quartInOut(t) {
        return t < 0.5
            ? +8.0 * Math.pow(t, 4.0)
            : -8.0 * Math.pow(t - 1.0, 4.0) + 1.0;
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    /* src/Consensus.svelte generated by Svelte v3.47.0 */
    const file$2 = "src/Consensus.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	child_ctx[27] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	child_ctx[30] = i;
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[31] = list[i];
    	child_ctx[27] = i;
    	return child_ctx;
    }

    function get_each_context_3$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[31] = list[i];
    	child_ctx[27] = i;
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i];
    	child_ctx[30] = i;
    	return child_ctx;
    }

    // (222:10) {:else}
    function create_else_block(ctx) {
    	let text_1;
    	let t;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			t = text("C");
    			attr_dev(text_1, "transform", "translate(0, -4)");
    			attr_dev(text_1, "class", "ranker-name svelte-jsxses");
    			add_location(text_1, file$2, 222, 12, 7637);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(222:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (220:10) {#if i < 3}
    function create_if_block_2(ctx) {
    	let text_1;
    	let t0;
    	let t1_value = /*i*/ ctx[27] + 1 + "";
    	let t1;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			t0 = text("R");
    			t1 = text(t1_value);
    			attr_dev(text_1, "transform", "translate(0, -4)");
    			attr_dev(text_1, "class", "ranker-name svelte-jsxses");
    			add_location(text_1, file$2, 220, 12, 7536);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t0);
    			append_dev(text_1, t1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(220:10) {#if i < 3}",
    		ctx
    	});

    	return block;
    }

    // (225:10) {#each ranking as candidate, j}
    function create_each_block_4(ctx) {
    	let g;
    	let text_1;
    	let t_value = /*candidate*/ ctx[34] + "";
    	let t;
    	let rect;
    	let rect_x_value;
    	let g_transform_value;

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			text_1 = svg_element("text");
    			t = text(t_value);
    			rect = svg_element("rect");

    			attr_dev(text_1, "class", "candidate-name " + (/*candidate*/ ctx[34] === /*initialCandidate*/ ctx[13]
    			? 'selected'
    			: '') + " svelte-jsxses");

    			attr_dev(text_1, "dy", "5px");
    			add_location(text_1, file$2, 226, 14, 7837);
    			attr_dev(rect, "x", rect_x_value = -/*candidateHeight*/ ctx[3] / 2);
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", "50");
    			attr_dev(rect, "height", /*candidateHeight*/ ctx[3]);
    			attr_dev(rect, "fill", "transparent");
    			add_location(rect, file$2, 228, 14, 7974);
    			attr_dev(g, "transform", g_transform_value = "translate(0, " + /*j*/ ctx[30] * /*candidateHeight*/ ctx[3] + ")");
    			add_location(g, file$2, 225, 12, 7771);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, text_1);
    			append_dev(text_1, t);
    			append_dev(g, rect);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*candidateHeight*/ 8 && rect_x_value !== (rect_x_value = -/*candidateHeight*/ ctx[3] / 2)) {
    				attr_dev(rect, "x", rect_x_value);
    			}

    			if (dirty[0] & /*candidateHeight*/ 8) {
    				attr_dev(rect, "height", /*candidateHeight*/ ctx[3]);
    			}

    			if (dirty[0] & /*candidateHeight*/ 8 && g_transform_value !== (g_transform_value = "translate(0, " + /*j*/ ctx[30] * /*candidateHeight*/ ctx[3] + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(225:10) {#each ranking as candidate, j}",
    		ctx
    	});

    	return block;
    }

    // (218:6) {#each allRankings as ranking, i}
    function create_each_block_3$1(ctx) {
    	let g;
    	let if_block_anchor;
    	let g_transform_value;

    	function select_block_type(ctx, dirty) {
    		if (/*i*/ ctx[27] < 3) return create_if_block_2;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);
    	let each_value_4 = /*ranking*/ ctx[31];
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			if_block.c();
    			if_block_anchor = empty();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(g, "transform", g_transform_value = "translate(" + /*i*/ ctx[27] * /*rankerWidth*/ ctx[4] + ", 0)");
    			add_location(g, file$2, 218, 8, 7454);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			if_block.m(g, null);
    			append_dev(g, if_block_anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*candidateHeight, allRankings, initialCandidate*/ 10248) {
    				each_value_4 = /*ranking*/ ctx[31];
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_4.length;
    			}

    			if (dirty[0] & /*rankerWidth*/ 16 && g_transform_value !== (g_transform_value = "translate(" + /*i*/ ctx[27] * /*rankerWidth*/ ctx[4] + ", 0)")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			if_block.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3$1.name,
    		type: "each",
    		source: "(218:6) {#each allRankings as ranking, i}",
    		ctx
    	});

    	return block;
    }

    // (254:6) {#if step <= 3}
    function create_if_block_1(ctx) {
    	let each_1_anchor;
    	let each_value_2 = /*baseRankings*/ ctx[10];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$highlightLines, $l1Opacity*/ 192) {
    				each_value_2 = /*baseRankings*/ ctx[10];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(254:6) {#if step <= 3}",
    		ctx
    	});

    	return block;
    }

    // (255:8) {#each baseRankings as ranking, i}
    function create_each_block_2$1(ctx) {
    	let line;
    	let line_x__value;
    	let line_y__value;
    	let line_x__value_1;
    	let line_y__value_1;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "x1", line_x__value = /*$highlightLines*/ ctx[6][/*i*/ ctx[27]].x1);
    			attr_dev(line, "y1", line_y__value = /*$highlightLines*/ ctx[6][/*i*/ ctx[27]].y1);
    			attr_dev(line, "x2", line_x__value_1 = /*$highlightLines*/ ctx[6][/*i*/ ctx[27]].x2);
    			attr_dev(line, "y2", line_y__value_1 = /*$highlightLines*/ ctx[6][/*i*/ ctx[27]].y2);
    			attr_dev(line, "stroke", "steelblue");
    			attr_dev(line, "opacity", /*$l1Opacity*/ ctx[7]);
    			attr_dev(line, "stroke-width", 5);
    			attr_dev(line, "stroke-linecap", "round");
    			add_location(line, file$2, 255, 10, 8859);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$highlightLines*/ 64 && line_x__value !== (line_x__value = /*$highlightLines*/ ctx[6][/*i*/ ctx[27]].x1)) {
    				attr_dev(line, "x1", line_x__value);
    			}

    			if (dirty[0] & /*$highlightLines*/ 64 && line_y__value !== (line_y__value = /*$highlightLines*/ ctx[6][/*i*/ ctx[27]].y1)) {
    				attr_dev(line, "y1", line_y__value);
    			}

    			if (dirty[0] & /*$highlightLines*/ 64 && line_x__value_1 !== (line_x__value_1 = /*$highlightLines*/ ctx[6][/*i*/ ctx[27]].x2)) {
    				attr_dev(line, "x2", line_x__value_1);
    			}

    			if (dirty[0] & /*$highlightLines*/ 64 && line_y__value_1 !== (line_y__value_1 = /*$highlightLines*/ ctx[6][/*i*/ ctx[27]].y2)) {
    				attr_dev(line, "y2", line_y__value_1);
    			}

    			if (dirty[0] & /*$l1Opacity*/ 128) {
    				attr_dev(line, "opacity", /*$l1Opacity*/ ctx[7]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(255:8) {#each baseRankings as ranking, i}",
    		ctx
    	});

    	return block;
    }

    // (268:6) {#if step > 3}
    function create_if_block$1(ctx) {
    	let each_1_anchor;
    	let each_value = /*$diffLines*/ ctx[8];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$diffLines, step*/ 257) {
    				each_value = /*$diffLines*/ ctx[8];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(268:6) {#if step > 3}",
    		ctx
    	});

    	return block;
    }

    // (270:10) {#each diffLine as line, j}
    function create_each_block_1$1(ctx) {
    	let line;
    	let line_x__value;
    	let line_y__value;
    	let line_x__value_1;
    	let line_y__value_1;
    	let line_stroke_width_value;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "x1", line_x__value = /*line*/ ctx[28].x1);
    			attr_dev(line, "y1", line_y__value = /*line*/ ctx[28].y1);
    			attr_dev(line, "x2", line_x__value_1 = /*line*/ ctx[28].x2);
    			attr_dev(line, "y2", line_y__value_1 = /*line*/ ctx[28].y2);
    			attr_dev(line, "stroke", "steelblue");
    			attr_dev(line, "opacity", 0.333333);
    			attr_dev(line, "stroke-width", line_stroke_width_value = /*step*/ ctx[0] > 5 ? 5 : 2);
    			attr_dev(line, "stroke-linecap", "round");
    			add_location(line, file$2, 270, 12, 9303);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$diffLines*/ 256 && line_x__value !== (line_x__value = /*line*/ ctx[28].x1)) {
    				attr_dev(line, "x1", line_x__value);
    			}

    			if (dirty[0] & /*$diffLines*/ 256 && line_y__value !== (line_y__value = /*line*/ ctx[28].y1)) {
    				attr_dev(line, "y1", line_y__value);
    			}

    			if (dirty[0] & /*$diffLines*/ 256 && line_x__value_1 !== (line_x__value_1 = /*line*/ ctx[28].x2)) {
    				attr_dev(line, "x2", line_x__value_1);
    			}

    			if (dirty[0] & /*$diffLines*/ 256 && line_y__value_1 !== (line_y__value_1 = /*line*/ ctx[28].y2)) {
    				attr_dev(line, "y2", line_y__value_1);
    			}

    			if (dirty[0] & /*step*/ 1 && line_stroke_width_value !== (line_stroke_width_value = /*step*/ ctx[0] > 5 ? 5 : 2)) {
    				attr_dev(line, "stroke-width", line_stroke_width_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(270:10) {#each diffLine as line, j}",
    		ctx
    	});

    	return block;
    }

    // (269:8) {#each $diffLines as diffLine, i}
    function create_each_block$1(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*diffLine*/ ctx[25];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$diffLines, step*/ 257) {
    				each_value_1 = /*diffLine*/ ctx[25];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(269:8) {#each $diffLines as diffLine, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let svg;
    	let g0;
    	let g1;
    	let line0;
    	let line0_x__value;
    	let line0_x__value_1;
    	let line0_y__value_1;
    	let line1;
    	let line1_y__value;
    	let line1_x__value_1;
    	let line1_y__value_1;
    	let if_block0_anchor;
    	let div_resize_listener;
    	let each_value_3 = /*allRankings*/ ctx[11];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3$1(get_each_context_3$1(ctx, each_value_3, i));
    	}

    	let if_block0 = /*step*/ ctx[0] <= 3 && create_if_block_1(ctx);
    	let if_block1 = /*step*/ ctx[0] > 3 && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			g0 = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			g1 = svg_element("g");
    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();
    			if (if_block1) if_block1.c();
    			attr_dev(g0, "transform", "translate(" + /*margin*/ ctx[9].left + ", " + /*margin*/ ctx[9].top + ")");
    			add_location(g0, file$2, 216, 4, 7351);
    			attr_dev(line0, "x1", line0_x__value = /*baseRankings*/ ctx[10].length * /*rankerWidth*/ ctx[4] + /*rankerWidth*/ ctx[4] / 2);
    			attr_dev(line0, "y1", 0);
    			attr_dev(line0, "x2", line0_x__value_1 = /*baseRankings*/ ctx[10].length * /*rankerWidth*/ ctx[4] + /*rankerWidth*/ ctx[4] / 2);
    			attr_dev(line0, "y2", line0_y__value_1 = /*totalCandidates*/ ctx[12] * /*candidateHeight*/ ctx[3]);
    			attr_dev(line0, "stroke", "rgba(0,0,0,.1)");
    			attr_dev(line0, "stroke-width", 1);
    			attr_dev(line0, "stroke-linecap", "round");
    			add_location(line0, file$2, 235, 6, 8205);
    			attr_dev(line1, "x1", 0);
    			attr_dev(line1, "y1", line1_y__value = /*consensusPosition*/ ctx[5] * /*candidateHeight*/ ctx[3]);
    			attr_dev(line1, "x2", line1_x__value_1 = /*baseRankings*/ ctx[10].length * /*rankerWidth*/ ctx[4] + /*rankerWidth*/ ctx[4]);
    			attr_dev(line1, "y2", line1_y__value_1 = /*consensusPosition*/ ctx[5] * /*candidateHeight*/ ctx[3]);
    			attr_dev(line1, "stroke", "rgba(0,0,0,0.1)");
    			attr_dev(line1, "stroke-width", 1);
    			attr_dev(line1, "stroke-linecap", "round");
    			add_location(line1, file$2, 244, 6, 8506);
    			attr_dev(g1, "transform", "translate(" + /*margin*/ ctx[9].left + ", " + /*margin*/ ctx[9].top + ")");
    			add_location(g1, file$2, 234, 4, 8144);
    			attr_dev(svg, "width", /*width*/ ctx[1]);
    			attr_dev(svg, "height", /*height*/ ctx[2]);
    			add_location(svg, file$2, 215, 2, 7324);
    			attr_dev(div, "class", "chart-container svelte-jsxses");
    			add_render_callback(() => /*div_elementresize_handler*/ ctx[18].call(div));
    			add_location(div, file$2, 213, 0, 7158);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, g0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g0, null);
    			}

    			append_dev(svg, g1);
    			append_dev(g1, line0);
    			append_dev(g1, line1);
    			if (if_block0) if_block0.m(g1, null);
    			append_dev(g1, if_block0_anchor);
    			if (if_block1) if_block1.m(g1, null);
    			div_resize_listener = add_resize_listener(div, /*div_elementresize_handler*/ ctx[18].bind(div));
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*rankerWidth, allRankings, candidateHeight, initialCandidate*/ 10264) {
    				each_value_3 = /*allRankings*/ ctx[11];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3$1(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}

    			if (dirty[0] & /*rankerWidth*/ 16 && line0_x__value !== (line0_x__value = /*baseRankings*/ ctx[10].length * /*rankerWidth*/ ctx[4] + /*rankerWidth*/ ctx[4] / 2)) {
    				attr_dev(line0, "x1", line0_x__value);
    			}

    			if (dirty[0] & /*rankerWidth*/ 16 && line0_x__value_1 !== (line0_x__value_1 = /*baseRankings*/ ctx[10].length * /*rankerWidth*/ ctx[4] + /*rankerWidth*/ ctx[4] / 2)) {
    				attr_dev(line0, "x2", line0_x__value_1);
    			}

    			if (dirty[0] & /*candidateHeight*/ 8 && line0_y__value_1 !== (line0_y__value_1 = /*totalCandidates*/ ctx[12] * /*candidateHeight*/ ctx[3])) {
    				attr_dev(line0, "y2", line0_y__value_1);
    			}

    			if (dirty[0] & /*consensusPosition, candidateHeight*/ 40 && line1_y__value !== (line1_y__value = /*consensusPosition*/ ctx[5] * /*candidateHeight*/ ctx[3])) {
    				attr_dev(line1, "y1", line1_y__value);
    			}

    			if (dirty[0] & /*rankerWidth*/ 16 && line1_x__value_1 !== (line1_x__value_1 = /*baseRankings*/ ctx[10].length * /*rankerWidth*/ ctx[4] + /*rankerWidth*/ ctx[4])) {
    				attr_dev(line1, "x2", line1_x__value_1);
    			}

    			if (dirty[0] & /*consensusPosition, candidateHeight*/ 40 && line1_y__value_1 !== (line1_y__value_1 = /*consensusPosition*/ ctx[5] * /*candidateHeight*/ ctx[3])) {
    				attr_dev(line1, "y2", line1_y__value_1);
    			}

    			if (/*step*/ ctx[0] <= 3) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(g1, if_block0_anchor);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*step*/ ctx[0] > 3) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(g1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty[0] & /*width*/ 2) {
    				attr_dev(svg, "width", /*width*/ ctx[1]);
    			}

    			if (dirty[0] & /*height*/ 4) {
    				attr_dev(svg, "height", /*height*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			div_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let consensusPosition;
    	let candidateDiff;
    	let candidateHeight;
    	let rankerWidth;
    	let $highlightLines;
    	let $l1Opacity;
    	let $diffLines;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Consensus', slots, []);
    	let { step } = $$props;
    	let width;
    	let height;
    	const margin = { top: 50, bottom: 30, left: 30, right: 30 };

    	const baseRankings = [
    		[
    			12,
    			9,
    			19,
    			22,
    			35,
    			25,
    			37,
    			27,
    			48,
    			36,
    			59,
    			45,
    			38,
    			42,
    			0,
    			17,
    			30,
    			2,
    			33,
    			28,
    			26,
    			56,
    			3,
    			40,
    			16,
    			41,
    			1,
    			32,
    			47,
    			21,
    			55,
    			14,
    			50,
    			23,
    			34,
    			24,
    			39,
    			5,
    			13,
    			43,
    			31,
    			20,
    			52,
    			44,
    			18,
    			53,
    			51,
    			11,
    			4,
    			15,
    			8,
    			57,
    			49,
    			58,
    			7,
    			29,
    			10,
    			54,
    			6,
    			46
    		],
    		[
    			19,
    			37,
    			9,
    			36,
    			45,
    			38,
    			59,
    			48,
    			5,
    			32,
    			35,
    			41,
    			22,
    			16,
    			27,
    			42,
    			25,
    			17,
    			26,
    			21,
    			30,
    			56,
    			1,
    			2,
    			14,
    			23,
    			33,
    			40,
    			3,
    			12,
    			28,
    			18,
    			8,
    			34,
    			53,
    			55,
    			0,
    			44,
    			29,
    			52,
    			13,
    			31,
    			43,
    			39,
    			20,
    			47,
    			57,
    			24,
    			50,
    			51,
    			54,
    			11,
    			49,
    			58,
    			4,
    			6,
    			7,
    			15,
    			10,
    			46
    		],
    		[
    			19,
    			37,
    			36,
    			38,
    			9,
    			41,
    			35,
    			45,
    			5,
    			12,
    			22,
    			33,
    			2,
    			42,
    			32,
    			48,
    			1,
    			25,
    			17,
    			3,
    			21,
    			14,
    			16,
    			27,
    			29,
    			59,
    			26,
    			30,
    			43,
    			44,
    			28,
    			53,
    			8,
    			18,
    			23,
    			40,
    			13,
    			0,
    			34,
    			31,
    			47,
    			56,
    			55,
    			57,
    			20,
    			49,
    			52,
    			58,
    			39,
    			50,
    			51,
    			24,
    			11,
    			4,
    			54,
    			15,
    			7,
    			10,
    			46,
    			6
    		]
    	];

    	// const consensusRanking = [
    	//   19, 37, 9, 36, 45, 38, 35, 48, 41, 12, 22, 5, 59, 42, 25, 27, 32, 17, 2, 33, 16, 30, 26, 21, 3, 1, 56, 28, 14, 23,
    	//   40, 18, 0, 34, 53, 44, 8, 43, 55, 29, 13, 47, 31, 52, 39, 20, 57, 50, 24, 51, 11, 49, 58, 4, 54, 15, 7, 10, 6, 46,
    	// ]
    	const consensusRanking = [
    		19,
    		37,
    		9,
    		36,
    		45,
    		38,
    		35,
    		48,
    		41,
    		12,
    		22,
    		5,
    		59,
    		42,
    		25,
    		27,
    		26,
    		16,
    		2,
    		33,
    		21,
    		30,
    		32,
    		3,
    		23,
    		1,
    		56,
    		28,
    		14,
    		8,
    		40,
    		18,
    		31,
    		34,
    		53,
    		44,
    		58,
    		13,
    		54,
    		43,
    		52,
    		15,
    		6,
    		20,
    		46,
    		50,
    		17,
    		29,
    		0,
    		47,
    		57,
    		24,
    		55,
    		51,
    		39,
    		49,
    		11,
    		10,
    		4,
    		7
    	];

    	const allRankings = [...baseRankings, consensusRanking];
    	const totalRankings = allRankings.length;
    	const totalCandidates = consensusRanking.length;
    	const totalBaseRankings = baseRankings.length;
    	let initialCandidate = 12;

    	const lineTweenOptions = {
    		delay: 0,
    		duration: 1000,
    		easing: quartInOut
    	};

    	const fadeTweenOptions = {
    		delay: 0,
    		duration: 500,
    		easing: quartInOut
    	};

    	const l1Opacity = tweened(0, fadeTweenOptions);
    	validate_store(l1Opacity, 'l1Opacity');
    	component_subscribe($$self, l1Opacity, value => $$invalidate(7, $l1Opacity = value));

    	// const p1 = tweened([20, 20], lineTweenOptions)
    	const highlightLines = tweened(baseRankings.map(ranking => ({ x1: 20, y1: 20, x2: 20, y2: 20 })), lineTweenOptions);

    	validate_store(highlightLines, 'highlightLines');
    	component_subscribe($$self, highlightLines, value => $$invalidate(6, $highlightLines = value));

    	// const consensusPositions = consensusRanking.filter((a, i) => i === 1)
    	const allDiffs = consensusRanking.filter((a, i) => i < 100).map((ranking, i) => {
    		return baseRankings.map((baseRanking, j) => i - baseRanking.indexOf(ranking));
    	});

    	const diffLines = tweened(
    		allDiffs.map((diffs, consensusPosition) => diffs.map((diff, i) => {

    			// return {
    			//   x1: i * rankerWidth + 20,
    			//   y1: a > b ? a : b,
    			//   x2: i * rankerWidth + 20,
    			//   y2: a > b ? b : a,
    			// }
    			return { x1: 0, y1: 0, x2: 0, y2: 0 };
    		})),
    		// allDiffs.map((diffs) => ({ x1: 20, y1: 20, x2: 20, y2: 20 })),
    		lineTweenOptions
    	); //{ x1: 20, y1: 20, x2: 20, y2: 20 })),

    	validate_store(diffLines, 'diffLines');
    	component_subscribe($$self, diffLines, value => $$invalidate(8, $diffLines = value));
    	const writable_props = ['step'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Consensus> was created with unknown prop '${key}'`);
    	});

    	function div_elementresize_handler() {
    		width = this.offsetWidth;
    		height = this.offsetHeight;
    		$$invalidate(1, width);
    		$$invalidate(2, height);
    	}

    	$$self.$$set = $$props => {
    		if ('step' in $$props) $$invalidate(0, step = $$props.step);
    	};

    	$$self.$capture_state = () => ({
    		step,
    		tweened,
    		quartInOut,
    		width,
    		height,
    		margin,
    		baseRankings,
    		consensusRanking,
    		allRankings,
    		totalRankings,
    		totalCandidates,
    		totalBaseRankings,
    		initialCandidate,
    		lineTweenOptions,
    		fadeTweenOptions,
    		l1Opacity,
    		highlightLines,
    		allDiffs,
    		diffLines,
    		candidateHeight,
    		rankerWidth,
    		consensusPosition,
    		candidateDiff,
    		$highlightLines,
    		$l1Opacity,
    		$diffLines
    	});

    	$$self.$inject_state = $$props => {
    		if ('step' in $$props) $$invalidate(0, step = $$props.step);
    		if ('width' in $$props) $$invalidate(1, width = $$props.width);
    		if ('height' in $$props) $$invalidate(2, height = $$props.height);
    		if ('initialCandidate' in $$props) $$invalidate(13, initialCandidate = $$props.initialCandidate);
    		if ('candidateHeight' in $$props) $$invalidate(3, candidateHeight = $$props.candidateHeight);
    		if ('rankerWidth' in $$props) $$invalidate(4, rankerWidth = $$props.rankerWidth);
    		if ('consensusPosition' in $$props) $$invalidate(5, consensusPosition = $$props.consensusPosition);
    		if ('candidateDiff' in $$props) $$invalidate(17, candidateDiff = $$props.candidateDiff);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*consensusPosition*/ 32) {
    			$$invalidate(17, candidateDiff = baseRankings.map(ranking => consensusPosition - ranking.indexOf(initialCandidate)));
    		}

    		if ($$self.$$.dirty[0] & /*height*/ 4) {
    			$$invalidate(3, candidateHeight = (height - margin.top - margin.bottom || 200) / totalCandidates);
    		}

    		if ($$self.$$.dirty[0] & /*width*/ 2) {
    			$$invalidate(4, rankerWidth = (width - margin.left - margin.right || 200) / totalRankings);
    		}

    		if ($$self.$$.dirty[0] & /*step, candidateDiff, consensusPosition, candidateHeight, rankerWidth*/ 131129) {
    			// const p2 = tweened([50, 60], lineTweenOptions)
    			if (step === 0) {
    				l1Opacity.set(0);

    				highlightLines.set(candidateDiff.map((diff, i) => {
    					const a = (consensusPosition - diff) * candidateHeight;
    					const b = consensusPosition * candidateHeight;

    					return {
    						x1: i * rankerWidth + 20,
    						y1: a > b ? a : b,
    						x2: i * rankerWidth + 20,
    						y2: a > b ? b : a
    					};
    				}));
    			} else if (step === 1) {
    				l1Opacity.set(1);

    				highlightLines.set(candidateDiff.map((diff, i) => {
    					const a = (consensusPosition - diff) * candidateHeight;
    					const b = consensusPosition * candidateHeight;

    					return {
    						x1: i * rankerWidth + 20,
    						y1: a > b ? a : b,
    						x2: i * rankerWidth + 20,
    						y2: a > b ? b : a
    					};
    				}));
    			} else if (step === 2) {
    				l1Opacity.set(1 / totalBaseRankings);

    				highlightLines.set(candidateDiff.map((diff, i) => {
    					const a = (consensusPosition - diff) * candidateHeight;
    					const b = consensusPosition * candidateHeight;

    					return {
    						x1: totalBaseRankings * rankerWidth + 20,
    						y1: a > b ? a : b,
    						x2: totalBaseRankings * rankerWidth + 20,
    						y2: a > b ? b : a
    					};
    				})); // candidateDiff.map((diff, i) => ({
    				//   x1: totalBaseRankings * rankerWidth + rankerWidth / 2,
    			} else //   x2: totalBaseRankings * rankerWidth + rankerWidth / 2 + diff * 5,
    			//   y2: consensusPosition * candidateHeight,
    			// })),
    			if (step === 3) {
    				l1Opacity.set(1 / totalBaseRankings); //   y1: consensusPosition * candidateHeight,

    				highlightLines.set(candidateDiff.map((diff, i) => {
    					const a = totalBaseRankings * rankerWidth + rankerWidth / 2;
    					const b = totalBaseRankings * rankerWidth + rankerWidth / 2 - diff * 5;

    					return {
    						x1: a > b ? a : b,
    						y1: consensusPosition * candidateHeight,
    						x2: a > b ? b : a,
    						y2: consensusPosition * candidateHeight
    					};
    				}));
    			} else if (step === 4) {
    				l1Opacity.set(1 / totalBaseRankings);

    				diffLines.set(allDiffs.map((diffs, consensusPosition) => diffs.map((diff, i) => {
    					let a = (consensusPosition - diff) * candidateHeight;
    					let b = consensusPosition * candidateHeight;

    					return {
    						x1: i * rankerWidth + 20 + 2 * consensusPosition,
    						y1: a > b ? a : b,
    						x2: i * rankerWidth + 20 + 2 * consensusPosition,
    						y2: a > b ? b : a
    					};
    				})));
    			} else if (step === 5) {
    				// l1Opacity.set(1 / totalBaseRankings)
    				diffLines.set(allDiffs.map((diffs, consensusPosition) => diffs.map((diff, i) => {
    					const a = (consensusPosition - diff) * candidateHeight;
    					const b = consensusPosition * candidateHeight;

    					return {
    						x1: totalBaseRankings * rankerWidth + 20 + 2 * consensusPosition,
    						y1: a > b ? a : b,
    						x2: totalBaseRankings * rankerWidth + 20 + 2 * consensusPosition,
    						y2: a > b ? b : a
    					};
    				})));
    			} else if (step === 6) {
    				diffLines.set(allDiffs.map((diffs, consensusPosition) => diffs.map((diff, i) => {
    					const a = totalBaseRankings * rankerWidth + rankerWidth / 2;
    					const b = totalBaseRankings * rankerWidth + rankerWidth / 2 - diff * 5;

    					return {
    						x1: a > b ? a : b,
    						y1: consensusPosition * candidateHeight,
    						x2: a > b ? b : a,
    						y2: consensusPosition * candidateHeight
    					};
    				})));
    			}
    		}
    	};

    	$$invalidate(5, consensusPosition = consensusRanking.indexOf(initialCandidate));

    	return [
    		step,
    		width,
    		height,
    		candidateHeight,
    		rankerWidth,
    		consensusPosition,
    		$highlightLines,
    		$l1Opacity,
    		$diffLines,
    		margin,
    		baseRankings,
    		allRankings,
    		totalCandidates,
    		initialCandidate,
    		l1Opacity,
    		highlightLines,
    		diffLines,
    		candidateDiff,
    		div_elementresize_handler
    	];
    }

    class Consensus extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { step: 0 }, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Consensus",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*step*/ ctx[0] === undefined && !('step' in props)) {
    			console.warn("<Consensus> was created without expected prop 'step'");
    		}
    	}

    	get step() {
    		throw new Error("<Consensus>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set step(value) {
    		throw new Error("<Consensus>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function define(constructor, factory, prototype) {
      constructor.prototype = factory.prototype = prototype;
      prototype.constructor = constructor;
    }

    function extend(parent, definition) {
      var prototype = Object.create(parent.prototype);
      for (var key in definition) prototype[key] = definition[key];
      return prototype;
    }

    function Color() {}

    var darker = 0.7;
    var brighter = 1 / darker;

    var reI = "\\s*([+-]?\\d+)\\s*",
        reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*",
        reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
        reHex = /^#([0-9a-f]{3,8})$/,
        reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`),
        reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`),
        reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`),
        reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`),
        reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`),
        reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);

    var named = {
      aliceblue: 0xf0f8ff,
      antiquewhite: 0xfaebd7,
      aqua: 0x00ffff,
      aquamarine: 0x7fffd4,
      azure: 0xf0ffff,
      beige: 0xf5f5dc,
      bisque: 0xffe4c4,
      black: 0x000000,
      blanchedalmond: 0xffebcd,
      blue: 0x0000ff,
      blueviolet: 0x8a2be2,
      brown: 0xa52a2a,
      burlywood: 0xdeb887,
      cadetblue: 0x5f9ea0,
      chartreuse: 0x7fff00,
      chocolate: 0xd2691e,
      coral: 0xff7f50,
      cornflowerblue: 0x6495ed,
      cornsilk: 0xfff8dc,
      crimson: 0xdc143c,
      cyan: 0x00ffff,
      darkblue: 0x00008b,
      darkcyan: 0x008b8b,
      darkgoldenrod: 0xb8860b,
      darkgray: 0xa9a9a9,
      darkgreen: 0x006400,
      darkgrey: 0xa9a9a9,
      darkkhaki: 0xbdb76b,
      darkmagenta: 0x8b008b,
      darkolivegreen: 0x556b2f,
      darkorange: 0xff8c00,
      darkorchid: 0x9932cc,
      darkred: 0x8b0000,
      darksalmon: 0xe9967a,
      darkseagreen: 0x8fbc8f,
      darkslateblue: 0x483d8b,
      darkslategray: 0x2f4f4f,
      darkslategrey: 0x2f4f4f,
      darkturquoise: 0x00ced1,
      darkviolet: 0x9400d3,
      deeppink: 0xff1493,
      deepskyblue: 0x00bfff,
      dimgray: 0x696969,
      dimgrey: 0x696969,
      dodgerblue: 0x1e90ff,
      firebrick: 0xb22222,
      floralwhite: 0xfffaf0,
      forestgreen: 0x228b22,
      fuchsia: 0xff00ff,
      gainsboro: 0xdcdcdc,
      ghostwhite: 0xf8f8ff,
      gold: 0xffd700,
      goldenrod: 0xdaa520,
      gray: 0x808080,
      green: 0x008000,
      greenyellow: 0xadff2f,
      grey: 0x808080,
      honeydew: 0xf0fff0,
      hotpink: 0xff69b4,
      indianred: 0xcd5c5c,
      indigo: 0x4b0082,
      ivory: 0xfffff0,
      khaki: 0xf0e68c,
      lavender: 0xe6e6fa,
      lavenderblush: 0xfff0f5,
      lawngreen: 0x7cfc00,
      lemonchiffon: 0xfffacd,
      lightblue: 0xadd8e6,
      lightcoral: 0xf08080,
      lightcyan: 0xe0ffff,
      lightgoldenrodyellow: 0xfafad2,
      lightgray: 0xd3d3d3,
      lightgreen: 0x90ee90,
      lightgrey: 0xd3d3d3,
      lightpink: 0xffb6c1,
      lightsalmon: 0xffa07a,
      lightseagreen: 0x20b2aa,
      lightskyblue: 0x87cefa,
      lightslategray: 0x778899,
      lightslategrey: 0x778899,
      lightsteelblue: 0xb0c4de,
      lightyellow: 0xffffe0,
      lime: 0x00ff00,
      limegreen: 0x32cd32,
      linen: 0xfaf0e6,
      magenta: 0xff00ff,
      maroon: 0x800000,
      mediumaquamarine: 0x66cdaa,
      mediumblue: 0x0000cd,
      mediumorchid: 0xba55d3,
      mediumpurple: 0x9370db,
      mediumseagreen: 0x3cb371,
      mediumslateblue: 0x7b68ee,
      mediumspringgreen: 0x00fa9a,
      mediumturquoise: 0x48d1cc,
      mediumvioletred: 0xc71585,
      midnightblue: 0x191970,
      mintcream: 0xf5fffa,
      mistyrose: 0xffe4e1,
      moccasin: 0xffe4b5,
      navajowhite: 0xffdead,
      navy: 0x000080,
      oldlace: 0xfdf5e6,
      olive: 0x808000,
      olivedrab: 0x6b8e23,
      orange: 0xffa500,
      orangered: 0xff4500,
      orchid: 0xda70d6,
      palegoldenrod: 0xeee8aa,
      palegreen: 0x98fb98,
      paleturquoise: 0xafeeee,
      palevioletred: 0xdb7093,
      papayawhip: 0xffefd5,
      peachpuff: 0xffdab9,
      peru: 0xcd853f,
      pink: 0xffc0cb,
      plum: 0xdda0dd,
      powderblue: 0xb0e0e6,
      purple: 0x800080,
      rebeccapurple: 0x663399,
      red: 0xff0000,
      rosybrown: 0xbc8f8f,
      royalblue: 0x4169e1,
      saddlebrown: 0x8b4513,
      salmon: 0xfa8072,
      sandybrown: 0xf4a460,
      seagreen: 0x2e8b57,
      seashell: 0xfff5ee,
      sienna: 0xa0522d,
      silver: 0xc0c0c0,
      skyblue: 0x87ceeb,
      slateblue: 0x6a5acd,
      slategray: 0x708090,
      slategrey: 0x708090,
      snow: 0xfffafa,
      springgreen: 0x00ff7f,
      steelblue: 0x4682b4,
      tan: 0xd2b48c,
      teal: 0x008080,
      thistle: 0xd8bfd8,
      tomato: 0xff6347,
      turquoise: 0x40e0d0,
      violet: 0xee82ee,
      wheat: 0xf5deb3,
      white: 0xffffff,
      whitesmoke: 0xf5f5f5,
      yellow: 0xffff00,
      yellowgreen: 0x9acd32
    };

    define(Color, color, {
      copy(channels) {
        return Object.assign(new this.constructor, this, channels);
      },
      displayable() {
        return this.rgb().displayable();
      },
      hex: color_formatHex, // Deprecated! Use color.formatHex.
      formatHex: color_formatHex,
      formatHex8: color_formatHex8,
      formatHsl: color_formatHsl,
      formatRgb: color_formatRgb,
      toString: color_formatRgb
    });

    function color_formatHex() {
      return this.rgb().formatHex();
    }

    function color_formatHex8() {
      return this.rgb().formatHex8();
    }

    function color_formatHsl() {
      return hslConvert(this).formatHsl();
    }

    function color_formatRgb() {
      return this.rgb().formatRgb();
    }

    function color(format) {
      var m, l;
      format = (format + "").trim().toLowerCase();
      return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
          : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
          : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
          : l === 4 ? rgba((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
          : null) // invalid hex
          : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
          : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
          : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
          : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
          : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
          : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
          : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
          : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
          : null;
    }

    function rgbn(n) {
      return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
    }

    function rgba(r, g, b, a) {
      if (a <= 0) r = g = b = NaN;
      return new Rgb(r, g, b, a);
    }

    function rgbConvert(o) {
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Rgb;
      o = o.rgb();
      return new Rgb(o.r, o.g, o.b, o.opacity);
    }

    function rgb(r, g, b, opacity) {
      return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
    }

    function Rgb(r, g, b, opacity) {
      this.r = +r;
      this.g = +g;
      this.b = +b;
      this.opacity = +opacity;
    }

    define(Rgb, rgb, extend(Color, {
      brighter(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      darker(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      rgb() {
        return this;
      },
      clamp() {
        return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
      },
      displayable() {
        return (-0.5 <= this.r && this.r < 255.5)
            && (-0.5 <= this.g && this.g < 255.5)
            && (-0.5 <= this.b && this.b < 255.5)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      hex: rgb_formatHex, // Deprecated! Use color.formatHex.
      formatHex: rgb_formatHex,
      formatHex8: rgb_formatHex8,
      formatRgb: rgb_formatRgb,
      toString: rgb_formatRgb
    }));

    function rgb_formatHex() {
      return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
    }

    function rgb_formatHex8() {
      return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
    }

    function rgb_formatRgb() {
      const a = clampa(this.opacity);
      return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
    }

    function clampa(opacity) {
      return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
    }

    function clampi(value) {
      return Math.max(0, Math.min(255, Math.round(value) || 0));
    }

    function hex(value) {
      value = clampi(value);
      return (value < 16 ? "0" : "") + value.toString(16);
    }

    function hsla(h, s, l, a) {
      if (a <= 0) h = s = l = NaN;
      else if (l <= 0 || l >= 1) h = s = NaN;
      else if (s <= 0) h = NaN;
      return new Hsl(h, s, l, a);
    }

    function hslConvert(o) {
      if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Hsl;
      if (o instanceof Hsl) return o;
      o = o.rgb();
      var r = o.r / 255,
          g = o.g / 255,
          b = o.b / 255,
          min = Math.min(r, g, b),
          max = Math.max(r, g, b),
          h = NaN,
          s = max - min,
          l = (max + min) / 2;
      if (s) {
        if (r === max) h = (g - b) / s + (g < b) * 6;
        else if (g === max) h = (b - r) / s + 2;
        else h = (r - g) / s + 4;
        s /= l < 0.5 ? max + min : 2 - max - min;
        h *= 60;
      } else {
        s = l > 0 && l < 1 ? 0 : h;
      }
      return new Hsl(h, s, l, o.opacity);
    }

    function hsl(h, s, l, opacity) {
      return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
    }

    function Hsl(h, s, l, opacity) {
      this.h = +h;
      this.s = +s;
      this.l = +l;
      this.opacity = +opacity;
    }

    define(Hsl, hsl, extend(Color, {
      brighter(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      darker(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      rgb() {
        var h = this.h % 360 + (this.h < 0) * 360,
            s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
            l = this.l,
            m2 = l + (l < 0.5 ? l : 1 - l) * s,
            m1 = 2 * l - m2;
        return new Rgb(
          hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
          hsl2rgb(h, m1, m2),
          hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
          this.opacity
        );
      },
      clamp() {
        return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
      },
      displayable() {
        return (0 <= this.s && this.s <= 1 || isNaN(this.s))
            && (0 <= this.l && this.l <= 1)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      formatHsl() {
        const a = clampa(this.opacity);
        return `${a === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
      }
    }));

    function clamph(value) {
      value = (value || 0) % 360;
      return value < 0 ? value + 360 : value;
    }

    function clampt(value) {
      return Math.max(0, Math.min(1, value || 0));
    }

    /* From FvD 13.37, CSS Color Module Level 3 */
    function hsl2rgb(h, m1, m2) {
      return (h < 60 ? m1 + (m2 - m1) * h / 60
          : h < 180 ? m2
          : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
          : m1) * 255;
    }

    var baseRankings = [[52,44,7,100,48,26,60,46,110,47,96,120,91,6,71,236,58,79,1,21,251,87,177,118,105,277,90,205,8,140,75,148,382,134,160,260,178,152,289,56,325,169,157,111,168,211,391,142,135,221,286,272,171,418,180,281,194,416,362,352,356,9,266,375,278,235,182,5,475,410,2,335,451,10,38,456,395,30,13,498,12,3,19,434,49,445,364,11,0,17,14,407,476,59,4,20,27,23,61,24,42,15,28,18,385,31,484,83,34,54,16,22,35,45,50,85,33,25,51,88,66,39,94,32,55,68,78,63,62,82,64,43,57,72,37,69,53,29,40,74,81,77,119,92,122,108,127,84,95,97,67,89,80,36,76,93,41,104,99,101,123,113,146,115,130,70,125,112,147,116,98,65,117,121,102,109,136,86,131,139,124,103,114,154,106,153,133,145,155,138,129,137,187,132,126,141,128,149,150,159,151,107,73,156,158,144,161,174,163,143,175,166,213,188,172,173,165,162,195,181,193,179,183,224,186,192,207,189,210,170,167,204,191,214,216,198,200,190,197,242,184,176,199,201,218,206,232,212,247,209,229,233,217,203,222,220,226,230,164,223,215,227,225,185,248,253,270,231,239,258,196,228,254,202,257,244,245,249,263,208,234,246,237,238,241,250,255,280,267,240,259,262,306,243,264,271,269,261,279,295,275,290,274,219,256,291,276,282,304,265,268,287,285,273,301,292,283,298,252,296,297,321,299,293,319,326,323,310,317,336,307,308,288,318,329,312,320,294,300,334,331,316,313,322,305,284,311,315,302,327,324,328,343,339,345,349,303,340,348,359,333,357,341,342,365,387,332,351,354,309,353,390,346,369,344,376,360,358,337,314,338,371,330,350,411,347,398,370,363,397,355,366,361,403,392,383,389,400,373,384,386,367,388,381,413,402,415,417,374,393,377,409,422,394,399,379,404,430,368,408,444,405,378,380,433,421,396,450,442,426,440,420,436,412,441,454,372,428,485,431,424,414,401,432,446,448,419,435,429,461,443,463,469,474,406,423,460,479,453,438,457,425,439,464,466,447,449,462,459,499,467,452,427,465,455,471,482,473,494,468,490,486,477,458,488,483,489,481,497,472,437,478,491,487,493,492,495,496,470,480],[260,100,157,8,7,26,120,251,6,21,52,118,56,60,1,75,111,87,90,91,134,110,105,182,352,58,177,169,135,140,148,142,2,71,171,47,96,160,211,178,281,180,194,205,289,221,235,236,46,79,266,272,44,278,14,286,395,434,335,168,356,451,364,456,382,0,391,418,407,410,416,277,325,445,362,498,475,22,484,375,385,152,3,4,31,9,10,30,476,13,23,15,16,17,18,19,20,12,11,24,29,34,28,25,48,5,80,86,27,35,36,37,42,39,40,41,38,32,45,49,77,51,53,54,55,57,59,61,62,179,81,65,204,67,112,69,76,98,137,74,70,50,78,43,64,82,114,119,113,33,121,89,92,93,131,95,97,72,99,165,102,216,73,101,94,108,107,68,85,122,115,116,117,84,88,104,123,124,109,66,127,128,129,130,141,208,106,136,153,199,133,63,138,144,145,162,197,126,202,143,132,154,164,230,83,181,161,159,163,155,139,151,217,237,210,173,149,170,196,296,156,227,166,185,201,195,146,189,190,203,192,238,187,176,147,198,184,207,186,188,257,174,223,191,226,209,172,212,256,225,220,103,167,218,247,249,222,242,231,193,158,183,224,229,150,200,232,233,175,228,214,239,240,287,248,219,244,273,259,243,285,299,271,252,292,258,282,253,279,254,246,261,267,308,264,265,206,268,269,270,250,245,318,275,276,234,280,303,263,125,255,241,329,342,274,213,323,294,295,284,283,298,215,366,334,302,262,304,343,297,337,306,309,312,336,393,324,314,333,370,317,291,328,320,330,322,293,319,346,327,374,288,305,331,307,338,290,358,332,315,339,357,341,301,365,344,345,326,347,380,349,300,386,316,379,355,369,310,359,360,361,363,351,311,453,376,384,372,340,378,474,398,368,401,353,354,348,381,383,321,438,377,388,447,390,419,350,394,396,367,371,399,400,441,402,448,373,446,406,408,461,313,412,413,437,415,428,431,397,411,405,423,389,499,495,427,387,429,422,392,432,433,435,436,414,466,439,478,417,442,479,487,463,467,403,457,481,404,464,468,455,488,458,409,460,430,462,452,491,459,421,440,443,469,470,471,472,424,449,477,425,454,480,426,420,483,485,486,444,482,489,450,490,492,493,494,465,496,497,473],[8,6,26,56,21,111,44,96,120,105,52,48,7,46,182,168,79,87,60,91,71,194,140,1,211,75,47,118,157,171,135,110,177,251,148,100,286,281,235,169,142,160,266,205,221,134,451,236,58,260,180,352,364,272,178,90,2,27,278,335,356,152,407,289,4,416,391,456,476,445,385,410,362,418,375,325,10,19,395,17,9,382,475,0,15,13,3,277,12,5,14,18,39,57,36,35,62,43,28,24,31,20,484,66,51,29,23,22,34,30,498,434,38,61,32,94,64,11,55,25,76,59,98,69,45,50,33,53,40,78,37,65,70,106,82,41,141,49,93,74,16,77,73,103,85,42,86,84,95,104,102,89,116,97,114,81,101,72,117,146,88,107,83,67,127,133,150,183,131,92,144,121,68,126,119,115,109,174,99,155,123,80,112,63,129,130,128,163,162,122,143,124,132,151,175,125,137,149,54,153,145,166,139,113,167,108,393,173,147,187,136,154,158,170,172,161,159,185,198,179,181,209,189,138,186,215,193,184,212,199,203,206,389,190,191,201,239,216,176,156,200,204,217,210,255,202,213,258,232,195,225,188,197,219,231,226,243,164,224,214,208,222,228,196,207,220,252,244,238,259,247,233,240,227,283,230,257,256,241,234,245,275,265,250,237,254,261,246,269,229,192,290,262,223,282,268,297,242,253,270,249,273,263,288,287,248,274,264,292,284,285,276,315,347,298,267,302,354,295,344,330,313,314,307,317,293,296,329,305,300,299,306,324,271,340,291,308,309,311,316,310,319,318,332,363,351,323,301,326,358,397,280,320,331,328,341,312,334,374,338,371,322,339,368,343,321,345,360,365,378,349,366,304,355,294,333,350,279,303,372,327,367,336,342,361,386,408,370,380,348,359,346,376,337,373,379,357,369,383,387,399,404,402,396,381,388,165,394,353,412,390,401,400,392,398,384,414,406,413,436,458,468,432,423,405,218,411,419,420,409,422,415,424,440,426,437,428,429,377,427,439,433,435,431,438,421,441,425,403,430,443,446,444,447,448,481,450,452,453,459,455,462,442,463,467,449,480,454,464,474,479,499,417,472,492,471,485,473,470,461,483,460,465,497,488,477,466,486,490,482,489,491,469,493,487,494,495,496,478,457]];

    var consensusRankings = [[8,100,26,7,52,6,120,21,44,60,56,96,48,46,111,91,1,87,105,251,118,110,71,79,75,47,157,182,140,177,58,90,260,134,148,169,135,211,160,142,171,205,168,236,281,178,194,221,286,180,352,289,235,266,272,2,278,335,356,451,364,152,391,382,456,418,416,410,407,395,325,277,362,445,375,475,9,10,0,4,3,498,434,385,13,14,476,19,30,17,5,12,15,27,20,18,31,23,484,24,28,22,11,34,35,38,39,16,25,36,29,61,51,42,59,49,45,32,57,62,55,43,66,94,50,54,37,69,64,33,53,40,78,76,41,77,98,82,74,81,65,85,70,86,93,67,95,89,80,72,119,97,92,84,88,114,104,102,101,83,68,99,73,112,121,116,127,122,131,117,113,108,115,123,146,107,106,109,63,141,130,124,137,129,103,133,136,153,128,155,145,144,126,138,132,139,162,154,143,125,150,163,147,151,149,174,159,187,161,173,166,175,158,179,156,181,172,170,165,183,189,204,186,216,210,167,199,193,198,195,185,190,184,201,188,197,191,217,203,176,209,212,213,200,202,192,207,164,224,206,226,232,214,225,230,208,222,220,247,227,196,231,215,242,239,233,218,223,238,258,257,229,237,228,244,256,248,240,219,259,249,243,254,253,255,245,234,252,246,270,250,241,261,282,269,265,263,275,287,267,264,273,262,271,268,285,292,290,279,274,276,296,295,283,280,299,298,297,306,308,284,329,323,317,318,291,304,302,293,288,319,307,393,312,294,334,324,315,301,336,320,326,314,305,309,310,300,331,330,343,322,316,313,328,311,303,344,332,327,342,339,340,333,341,345,358,347,321,354,349,365,338,351,366,346,374,357,337,370,363,360,359,355,371,369,348,386,376,361,397,350,380,368,378,389,379,353,372,398,390,383,367,387,384,373,381,388,402,400,399,394,408,396,401,377,412,392,411,413,415,404,405,419,406,436,422,414,432,441,433,428,409,431,423,440,403,446,429,426,420,438,448,435,424,437,430,421,417,427,453,439,474,442,447,444,468,461,443,458,463,450,479,425,499,467,464,481,466,454,462,460,459,457,455,452,449,485,469,471,472,488,477,473,465,483,480,486,482,470,490,491,489,492,487,478,497,495,494,493,496],[8,100,26,7,52,6,120,21,44,60,56,96,48,46,111,91,1,87,105,251,118,110,71,79,75,47,157,182,140,177,58,90,260,134,148,169,135,211,160,142,171,205,168,236,281,178,194,221,286,180,352,289,235,266,272,2,278,335,356,451,364,152,391,382,456,418,416,410,407,395,325,277,362,445,375,475,9,10,0,4,3,498,434,385,13,14,476,19,30,17,5,12,15,27,20,18,31,23,484,24,28,22,11,34,35,38,39,16,25,36,29,61,51,42,59,49,45,32,57,62,55,43,66,94,50,54,37,69,64,33,53,40,78,76,41,77,98,82,74,81,65,85,70,86,93,67,95,89,80,72,119,97,92,84,88,114,104,102,101,83,68,99,73,112,121,116,127,122,131,117,113,108,115,123,146,107,106,109,63,141,130,124,137,129,103,133,136,153,128,155,145,144,126,138,132,139,162,154,143,125,150,163,147,151,149,174,159,187,161,173,166,175,158,179,156,181,172,170,165,183,189,204,186,216,210,167,199,193,198,195,185,190,184,201,188,197,191,217,203,176,209,212,213,200,202,192,207,164,224,206,226,232,214,225,230,208,222,220,247,227,196,231,215,242,239,233,218,223,238,258,257,229,237,228,244,256,248,240,219,259,249,243,254,253,255,245,234,252,246,270,250,241,261,282,269,265,263,275,287,267,264,273,262,271,268,285,292,290,279,274,276,296,295,283,280,299,298,297,306,308,284,329,323,317,318,291,304,302,293,288,319,307,393,312,294,334,324,315,301,336,320,326,314,305,309,310,300,331,330,343,322,316,313,328,311,303,344,332,327,342,339,340,333,341,345,358,347,321,354,349,365,338,351,366,346,374,357,337,370,363,360,359,355,371,369,348,386,376,361,397,350,380,368,378,389,379,353,372,398,390,383,367,387,384,373,381,388,402,400,399,394,408,396,401,377,412,392,411,413,415,404,405,419,406,436,422,414,432,441,433,428,409,431,423,440,403,446,429,426,420,438,448,435,424,437,457,421,417,427,453,439,430,442,447,444,480,461,470,458,478,450,495,425,499,467,464,494,466,454,462,460,459,496,455,452,474,443,469,471,472,488,477,473,465,463,468,486,482,481,479,485,489,492,449,490,497,487,483,493,491],[8,100,26,7,52,6,120,21,44,60,56,96,48,46,111,91,1,87,105,251,118,110,71,79,75,47,157,182,140,177,58,90,260,134,148,169,135,211,160,142,171,205,168,236,281,178,194,221,286,180,352,289,235,266,272,2,278,335,356,451,364,152,391,382,456,418,416,410,407,395,325,277,362,445,375,475,9,10,0,4,3,498,434,385,13,14,476,19,30,17,5,12,15,27,20,18,31,23,484,24,28,22,11,34,35,38,39,16,25,36,29,61,51,42,59,49,45,32,57,62,55,43,66,94,50,54,37,69,64,33,53,40,78,76,41,77,98,82,74,81,65,85,70,86,93,67,95,89,80,72,119,97,92,84,88,114,104,102,101,83,68,99,73,112,121,116,127,122,131,117,113,108,115,123,146,107,106,109,63,141,130,124,137,129,103,133,136,153,128,155,145,144,126,138,132,139,162,154,143,125,150,163,147,151,149,174,159,187,161,173,166,175,158,179,156,181,172,170,165,183,189,204,186,216,210,167,199,193,198,195,185,190,184,201,188,197,191,217,203,176,209,212,213,200,202,192,207,164,224,206,226,232,214,225,230,208,222,220,247,227,196,231,215,242,239,233,218,223,238,258,257,229,237,228,244,256,248,240,219,259,249,243,254,253,255,245,234,252,246,270,250,241,261,282,269,265,263,275,287,267,264,273,262,271,268,285,292,290,279,274,276,296,295,283,280,299,298,297,306,308,284,329,323,317,318,291,304,302,293,288,319,307,393,312,294,334,324,315,301,336,320,326,314,305,309,310,300,331,330,343,322,316,313,328,311,303,344,332,327,342,339,340,333,341,345,358,347,321,354,349,365,338,351,366,346,374,357,337,370,363,360,359,355,381,348,390,386,376,392,397,350,380,368,378,389,379,429,372,415,414,437,367,387,384,457,480,470,402,400,420,394,408,396,401,371,412,478,411,413,495,361,455,473,406,489,422,494,496,373,433,428,369,388,423,440,403,446,399,404,353,438,448,435,424,398,383,405,417,427,453,439,419,442,447,444,377,461,436,458,432,450,441,425,499,467,464,431,466,454,462,460,459,409,452,469,426,493,486,471,472,488,477,430,465,421,482,443,474,468,481,463,479,492,449,485,497,490,487,483,491],[8,100,26,7,52,6,120,21,44,60,56,96,48,46,111,91,1,87,105,251,118,110,71,79,75,47,157,182,140,177,58,90,260,134,148,169,135,211,160,142,171,205,168,236,281,178,194,221,286,180,352,289,235,266,272,2,278,335,356,451,364,152,391,382,456,418,416,410,407,395,325,277,362,445,375,475,9,10,0,4,3,498,434,385,13,14,476,19,30,17,5,12,15,27,20,18,31,23,484,24,28,22,11,34,35,38,39,16,25,36,29,61,51,42,59,49,45,32,57,62,55,43,66,94,50,54,37,69,64,33,53,40,78,76,41,77,98,82,74,81,65,85,70,86,93,67,95,89,80,72,119,97,92,84,88,114,104,102,101,83,68,99,73,112,121,116,127,122,131,117,113,108,115,123,146,107,106,109,63,141,130,124,137,129,103,133,136,153,128,155,145,144,126,138,132,139,162,154,143,125,150,163,147,151,149,174,159,187,161,173,166,175,158,179,156,181,172,170,165,183,189,204,186,216,210,167,199,193,198,195,185,190,184,201,188,197,191,217,203,176,209,212,213,200,202,192,207,164,224,206,226,232,214,225,230,208,222,220,247,227,196,231,215,242,239,233,218,223,238,258,257,229,237,228,244,256,248,240,219,259,249,243,254,253,255,245,234,252,246,270,250,241,261,282,269,265,263,275,287,267,264,273,262,271,268,285,292,290,279,274,276,296,295,283,280,299,297,306,293,308,284,329,323,317,301,307,304,302,319,347,393,341,320,348,357,370,331,390,343,392,328,326,314,303,429,310,300,420,327,339,358,316,313,363,298,321,344,354,349,342,338,340,333,366,381,374,359,350,415,414,379,355,400,376,437,397,380,457,368,378,360,318,387,384,402,401,433,365,480,455,423,473,489,470,478,422,495,372,408,411,403,367,446,494,427,442,496,447,435,444,461,424,396,458,440,453,450,417,413,425,499,346,467,462,460,452,469,486,482,466,477,492,497,291,493,288,389,394,312,412,438,406,315,428,336,294,334,324,305,448,439,330,309,311,322,351,332,337,345,386,361,373,371,388,369,464,399,353,454,404,398,459,405,419,436,383,441,377,471,472,488,431,432,465,409,421,426,474,430,443,468,481,463,479,449,485,490,487,483,491]];

    /* src/CompareConsensus.svelte generated by Svelte v3.47.0 */
    const file$1 = "src/CompareConsensus.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	child_ctx[18] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	child_ctx[21] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	child_ctx[24] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	child_ctx[18] = i;
    	return child_ctx;
    }

    // (44:8) {#each baseRankings as b, i}
    function create_each_block_3(ctx) {
    	let g;
    	let rect;
    	let text_1;
    	let t0;
    	let t1_value = /*i*/ ctx[18] + 1 + "";
    	let t1;
    	let text_1_font_weight_value;
    	let mounted;
    	let dispose;

    	function mouseenter_handler() {
    		return /*mouseenter_handler*/ ctx[11](/*i*/ ctx[18]);
    	}

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			rect = svg_element("rect");
    			text_1 = svg_element("text");
    			t0 = text("R");
    			t1 = text(t1_value);
    			attr_dev(rect, "x", 20);
    			attr_dev(rect, "y", 20 * /*i*/ ctx[18] + 10);
    			attr_dev(rect, "height", "20");
    			attr_dev(rect, "width", "20");
    			attr_dev(rect, "fill", /*colors*/ ctx[8][/*i*/ ctx[18]]);
    			attr_dev(rect, "opacity", "0.4");
    			add_location(rect, file$1, 52, 12, 1712);
    			attr_dev(text_1, "x", 50);
    			attr_dev(text_1, "y", 20 * /*i*/ ctx[18] + 20);
    			attr_dev(text_1, "dy", "0.35em");

    			attr_dev(text_1, "font-weight", text_1_font_weight_value = /*i*/ ctx[18] === /*hoverRanker*/ ctx[2]
    			? 'bold'
    			: 'normal');

    			add_location(text_1, file$1, 53, 12, 1810);
    			add_location(g, file$1, 44, 10, 1522);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, rect);
    			append_dev(g, text_1);
    			append_dev(text_1, t0);
    			append_dev(text_1, t1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(g, "mouseleave", /*mouseleave_handler*/ ctx[10], false, false, false),
    					listen_dev(g, "mouseenter", mouseenter_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*hoverRanker*/ 4 && text_1_font_weight_value !== (text_1_font_weight_value = /*i*/ ctx[18] === /*hoverRanker*/ ctx[2]
    			? 'bold'
    			: 'normal')) {
    				attr_dev(text_1, "font-weight", text_1_font_weight_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(44:8) {#each baseRankings as b, i}",
    		ctx
    	});

    	return block;
    }

    // (68:16) {#each diffs as diff, k}
    function create_each_block_2(ctx) {
    	let line;
    	let line_stroke_value;
    	let line_opacity_value;
    	let mounted;
    	let dispose;

    	function mouseenter_handler_1() {
    		return /*mouseenter_handler_1*/ ctx[12](/*j*/ ctx[21], /*i*/ ctx[18]);
    	}

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "x1", "0");
    			attr_dev(line, "y1", "0");
    			attr_dev(line, "x2", /*diff*/ ctx[22]);
    			attr_dev(line, "y2", "0");

    			attr_dev(line, "stroke", line_stroke_value = /*hoverRanker*/ ctx[2] === null || /*hoverRanker*/ ctx[2] === /*k*/ ctx[24]
    			? /*colors*/ ctx[8][/*k*/ ctx[24]]
    			: /*desaturatedColors*/ ctx[9][/*k*/ ctx[24]]);

    			attr_dev(line, "opacity", line_opacity_value = /*hoverRanker*/ ctx[2] === null || /*hoverRanker*/ ctx[2] === /*k*/ ctx[24]
    			? 0.4
    			: 0.25);

    			attr_dev(line, "stroke-width", "3");
    			add_location(line, file$1, 68, 18, 2435);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(line, "mouseenter", mouseenter_handler_1, false, false, false),
    					listen_dev(line, "mouseleave", /*mouseleave_handler_1*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*hoverRanker*/ 4 && line_stroke_value !== (line_stroke_value = /*hoverRanker*/ ctx[2] === null || /*hoverRanker*/ ctx[2] === /*k*/ ctx[24]
    			? /*colors*/ ctx[8][/*k*/ ctx[24]]
    			: /*desaturatedColors*/ ctx[9][/*k*/ ctx[24]])) {
    				attr_dev(line, "stroke", line_stroke_value);
    			}

    			if (dirty & /*hoverRanker*/ 4 && line_opacity_value !== (line_opacity_value = /*hoverRanker*/ ctx[2] === null || /*hoverRanker*/ ctx[2] === /*k*/ ctx[24]
    			? 0.4
    			: 0.25)) {
    				attr_dev(line, "opacity", line_opacity_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(68:16) {#each diffs as diff, k}",
    		ctx
    	});

    	return block;
    }

    // (66:12) {#each consensusRanking as diffs, j}
    function create_each_block_1(ctx) {
    	let g;
    	let g_transform_value;
    	let each_value_2 = /*diffs*/ ctx[19];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(g, "transform", g_transform_value = "translate(0, " + /*j*/ ctx[21] * /*candidateHeight*/ ctx[5] + ")");
    			add_location(g, file$1, 66, 14, 2324);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*diffConsensus, hoverRanker, colors, desaturatedColors, activeCandidatePos, activeRanker*/ 924) {
    				each_value_2 = /*diffs*/ ctx[19];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}

    			if (dirty & /*candidateHeight*/ 32 && g_transform_value !== (g_transform_value = "translate(0, " + /*j*/ ctx[21] * /*candidateHeight*/ ctx[5] + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(66:12) {#each consensusRanking as diffs, j}",
    		ctx
    	});

    	return block;
    }

    // (62:8) {#each diffConsensus as consensusRanking, i}
    function create_each_block(ctx) {
    	let g;
    	let text_1;
    	let t0;
    	let t1;
    	let each_value_1 = /*consensusRanking*/ ctx[16];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			text_1 = svg_element("text");
    			t0 = text("C");
    			t1 = text(/*i*/ ctx[18]);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(text_1, "text-anchor", "middle");
    			attr_dev(text_1, "dy", "-1em");
    			add_location(text_1, file$1, 63, 12, 2211);
    			attr_dev(g, "transform", "translate(" + (/*i*/ ctx[18] * 350 + 200) + ", 0)");
    			add_location(g, file$1, 62, 10, 2153);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, text_1);
    			append_dev(text_1, t0);
    			append_dev(text_1, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*candidateHeight, diffConsensus, hoverRanker, colors, desaturatedColors, activeCandidatePos, activeRanker*/ 956) {
    				each_value_1 = /*consensusRanking*/ ctx[16];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(62:8) {#each diffConsensus as consensusRanking, i}",
    		ctx
    	});

    	return block;
    }

    // (91:8) {#if activeRanker}
    function create_if_block(ctx) {
    	let g;
    	let rect;
    	let text_1;
    	let t_value = consensusRankings[/*activeRanker*/ ctx[3]][/*activeCandidatePos*/ ctx[4]] + "";
    	let t;
    	let g_transform_value;

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			rect = svg_element("rect");
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(rect, "x", -25);
    			attr_dev(rect, "y", 0);
    			attr_dev(rect, "height", "20");
    			attr_dev(rect, "width", "50");
    			attr_dev(rect, "fill", "white");
    			attr_dev(rect, "stroke", "#000");
    			add_location(rect, file$1, 93, 12, 3376);
    			attr_dev(text_1, "x", 0);
    			attr_dev(text_1, "y", 0);
    			attr_dev(text_1, "font-size", "12px");
    			attr_dev(text_1, "dy", "1.2em");
    			attr_dev(text_1, "text-anchor", "middle");
    			attr_dev(text_1, "font-weight", "bold");
    			add_location(text_1, file$1, 94, 12, 3461);
    			attr_dev(g, "transform", g_transform_value = "translate(" + (/*activeRanker*/ ctx[3] * 350 + 100) + ", " + (/*activeCandidatePos*/ ctx[4] * /*candidateHeight*/ ctx[5] - 10) + ")");
    			add_location(g, file$1, 92, 10, 3265);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, rect);
    			append_dev(g, text_1);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*activeRanker, activeCandidatePos*/ 24 && t_value !== (t_value = consensusRankings[/*activeRanker*/ ctx[3]][/*activeCandidatePos*/ ctx[4]] + "")) set_data_dev(t, t_value);

    			if (dirty & /*activeRanker, activeCandidatePos, candidateHeight*/ 56 && g_transform_value !== (g_transform_value = "translate(" + (/*activeRanker*/ ctx[3] * 350 + 100) + ", " + (/*activeCandidatePos*/ ctx[4] * /*candidateHeight*/ ctx[5] - 10) + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(91:8) {#if activeRanker}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let svg;
    	let g0;
    	let g1;
    	let each1_anchor;
    	let div1_resize_listener;
    	let each_value_3 = baseRankings;
    	validate_each_argument(each_value_3);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_1[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value = /*diffConsensus*/ ctx[7];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	let if_block = /*activeRanker*/ ctx[3] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Here are the consensus rankings of 500 canidates ranked by 3 rankers. Each of the consensus rankings are\n    algorithmically generated and subject to some constraints resulting in the variation. In this particular case, we\n    applied FairCopeland algorithm to generate consensus rankings of different levels of fairness and we see that\n    increasing the fairness results in more disagreement in the ranking.";
    			t1 = space();
    			div1 = element("div");
    			svg = svg_element("svg");
    			g0 = svg_element("g");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			g1 = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each1_anchor = empty();
    			if (if_block) if_block.c();
    			set_style(div0, "width", "500px");
    			set_style(div0, "text-align", "left");
    			set_style(div0, "margin", "0 auto");
    			set_style(div0, "padding", "2rem");
    			add_location(div0, file$1, 34, 2, 856);
    			add_location(g0, file$1, 42, 6, 1471);
    			attr_dev(g1, "transform", "translate(" + (/*margin*/ ctx[6].left + 0) + ", " + /*margin*/ ctx[6].top + ")");
    			add_location(g1, file$1, 60, 6, 2031);
    			attr_dev(svg, "height", /*height*/ ctx[0]);
    			attr_dev(svg, "width", /*width*/ ctx[1]);
    			add_location(svg, file$1, 41, 4, 1442);
    			attr_dev(div1, "class", "chart-container svelte-ifpi8q");
    			add_render_callback(() => /*div1_elementresize_handler*/ ctx[14].call(div1));
    			add_location(div1, file$1, 40, 2, 1356);
    			attr_dev(div2, "class", "container svelte-ifpi8q");
    			add_location(div2, file$1, 33, 0, 830);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, svg);
    			append_dev(svg, g0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(g0, null);
    			}

    			append_dev(svg, g1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g1, null);
    			}

    			append_dev(g1, each1_anchor);
    			if (if_block) if_block.m(g1, null);
    			div1_resize_listener = add_resize_listener(div1, /*div1_elementresize_handler*/ ctx[14].bind(div1));
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*hoverRanker, colors*/ 260) {
    				each_value_3 = baseRankings;
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_3(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(g0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_3.length;
    			}

    			if (dirty & /*diffConsensus, candidateHeight, hoverRanker, colors, desaturatedColors, activeCandidatePos, activeRanker*/ 956) {
    				each_value = /*diffConsensus*/ ctx[7];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g1, each1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*activeRanker*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(g1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*height*/ 1) {
    				attr_dev(svg, "height", /*height*/ ctx[0]);
    			}

    			if (dirty & /*width*/ 2) {
    				attr_dev(svg, "width", /*width*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			div1_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let candidateHeight;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CompareConsensus', slots, []);
    	const margin = { top: 80, bottom: 10, left: 30, right: 30 };
    	let width;
    	let height;
    	let hoverRanker = null;
    	const totalCandidates = consensusRankings[0].length;

    	const diffConsensus = consensusRankings.map((consensusRanking, i) => {
    		return consensusRanking.map((p, j) => {
    			return baseRankings.map(b => b.indexOf(p) - j);
    		});
    	});

    	const colors = ['red', 'blue', 'green', 'yellow'];

    	const desaturatedColors = colors.map(c => {
    		const dc = hsl(c);
    		dc.s = 0.1;
    		return dc + '';
    	});

    	let activeRanker = null;
    	let activeCandidatePos = null;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CompareConsensus> was created with unknown prop '${key}'`);
    	});

    	const mouseleave_handler = () => {
    		$$invalidate(2, hoverRanker = null);
    	};

    	const mouseenter_handler = i => {
    		$$invalidate(2, hoverRanker = i);
    	};

    	const mouseenter_handler_1 = (j, i) => {
    		$$invalidate(4, activeCandidatePos = j);
    		$$invalidate(3, activeRanker = i);
    	};

    	const mouseleave_handler_1 = () => {
    		$$invalidate(4, activeCandidatePos = null);
    		$$invalidate(3, activeRanker = null);
    	};

    	function div1_elementresize_handler() {
    		width = this.offsetWidth;
    		height = this.offsetHeight;
    		$$invalidate(1, width);
    		$$invalidate(0, height);
    	}

    	$$self.$capture_state = () => ({
    		hsl,
    		margin,
    		baseRankings,
    		consensusRankings,
    		width,
    		height,
    		hoverRanker,
    		totalCandidates,
    		diffConsensus,
    		colors,
    		desaturatedColors,
    		activeRanker,
    		activeCandidatePos,
    		candidateHeight
    	});

    	$$self.$inject_state = $$props => {
    		if ('width' in $$props) $$invalidate(1, width = $$props.width);
    		if ('height' in $$props) $$invalidate(0, height = $$props.height);
    		if ('hoverRanker' in $$props) $$invalidate(2, hoverRanker = $$props.hoverRanker);
    		if ('activeRanker' in $$props) $$invalidate(3, activeRanker = $$props.activeRanker);
    		if ('activeCandidatePos' in $$props) $$invalidate(4, activeCandidatePos = $$props.activeCandidatePos);
    		if ('candidateHeight' in $$props) $$invalidate(5, candidateHeight = $$props.candidateHeight);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*height*/ 1) {
    			$$invalidate(5, candidateHeight = (height - margin.top - margin.bottom || 200) / totalCandidates);
    		}
    	};

    	return [
    		height,
    		width,
    		hoverRanker,
    		activeRanker,
    		activeCandidatePos,
    		candidateHeight,
    		margin,
    		diffConsensus,
    		colors,
    		desaturatedColors,
    		mouseleave_handler,
    		mouseenter_handler,
    		mouseenter_handler_1,
    		mouseleave_handler_1,
    		div1_elementresize_handler
    	];
    }

    class CompareConsensus extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CompareConsensus",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.47.0 */
    const file = "src/App.svelte";

    // (30:6) <Scrolly bind:value>
    function create_default_slot(ctx) {
    	let div1;
    	let div0;
    	let p0;
    	let t0;
    	let strong0;
    	let t2;
    	let strong1;
    	let t4;
    	let strong2;
    	let t6;
    	let strong3;
    	let t8;
    	let t9;
    	let div3;
    	let div2;
    	let p1;
    	let t10;
    	let strong4;
    	let t12;
    	let p2;
    	let t14;
    	let div5;
    	let div4;
    	let t16;
    	let div7;
    	let div6;
    	let p3;
    	let t17;
    	let strong5;
    	let t19;
    	let t20;
    	let p4;
    	let t22;
    	let div9;
    	let div8;
    	let t24;
    	let div11;
    	let div10;
    	let t26;
    	let div13;
    	let div12;
    	let p5;
    	let t28;
    	let p6;
    	let t30;
    	let div14;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			t0 = text("Let's say we have 60 candidates with id from 0 to 59. And let's say we have 3 stakeholders (");
    			strong0 = element("strong");
    			strong0.textContent = "R1";
    			t2 = text(", ");
    			strong1 = element("strong");
    			strong1.textContent = "R2";
    			t4 = text(" and ");
    			strong2 = element("strong");
    			strong2.textContent = "R3";
    			t6 = text(") who rank the set of 60 candidates. And let's say\n              ");
    			strong3 = element("strong");
    			strong3.textContent = "C";
    			t8 = text(" is a consensus ranking that they agreed upon. These rankings are shown on the right.");
    			t9 = space();
    			div3 = element("div");
    			div2 = element("div");
    			p1 = element("p");
    			t10 = text("Let's see how much disagreement is present on the consensus ranking when considering candidate ");
    			strong4 = element("strong");
    			strong4.textContent = "12";
    			t12 = space();
    			p2 = element("p");
    			p2.textContent = "We draw a line from the position of 12 in consensus ranking and then highlight the difference to that line of each base ranking's position of candidate 12.";
    			t14 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div4.textContent = "We now overlay all the differences...";
    			t16 = space();
    			div7 = element("div");
    			div6 = element("div");
    			p3 = element("p");
    			t17 = text("And rotate it. This resulting line represents the amount of disagreement on candidate ");
    			strong5 = element("strong");
    			strong5.textContent = "12";
    			t19 = text(".");
    			t20 = space();
    			p4 = element("p");
    			p4.textContent = "One of the stakeholder completely agrees to the consensus ranking and the other two disagrees.";
    			t22 = space();
    			div9 = element("div");
    			div8 = element("div");
    			div8.textContent = "Next, we do the same thing for all the candidates. We take all the differences...";
    			t24 = space();
    			div11 = element("div");
    			div10 = element("div");
    			div10.textContent = "Overlay them...";
    			t26 = space();
    			div13 = element("div");
    			div12 = element("div");
    			p5 = element("p");
    			p5.textContent = "And rotate each of the disagreement lines.";
    			t28 = space();
    			p6 = element("p");
    			p6.textContent = "We can now analyse the agreement/disagreement on individual candidate. We can clearly see that all the stakeholders disagree on the lower ranked candidates, especially candidate 17.";
    			t30 = space();
    			div14 = element("div");
    			add_location(strong0, file, 33, 106, 1265);
    			add_location(strong1, file, 35, 17, 1318);
    			add_location(strong2, file, 35, 41, 1342);
    			add_location(strong3, file, 36, 14, 1426);
    			attr_dev(p0, "class", "w-text svelte-br0mhb");
    			add_location(p0, file, 32, 12, 1140);
    			attr_dev(div0, "class", "step-content svelte-br0mhb");
    			add_location(div0, file, 31, 10, 1101);
    			attr_dev(div1, "class", "step svelte-br0mhb");
    			toggle_class(div1, "active", /*value*/ ctx[0] === 0);
    			add_location(div1, file, 30, 8, 1045);
    			add_location(strong4, file, 48, 110, 2281);
    			add_location(p1, file, 48, 12, 2183);
    			add_location(p2, file, 49, 12, 2317);
    			attr_dev(div2, "class", "step-content svelte-br0mhb");
    			add_location(div2, file, 47, 10, 2144);
    			attr_dev(div3, "class", "step svelte-br0mhb");
    			toggle_class(div3, "active", /*value*/ ctx[0] === 1);
    			add_location(div3, file, 46, 8, 2088);
    			attr_dev(div4, "class", "step-content svelte-br0mhb");
    			add_location(div4, file, 56, 10, 2827);
    			attr_dev(div5, "class", "step svelte-br0mhb");
    			toggle_class(div5, "active", /*value*/ ctx[0] === 2);
    			add_location(div5, file, 55, 8, 2771);
    			add_location(strong5, file, 60, 101, 3104);
    			add_location(p3, file, 60, 12, 3015);
    			add_location(p4, file, 61, 12, 3141);
    			attr_dev(div6, "class", "step-content svelte-br0mhb");
    			add_location(div6, file, 59, 10, 2976);
    			attr_dev(div7, "class", "step svelte-br0mhb");
    			toggle_class(div7, "active", /*value*/ ctx[0] === 3);
    			add_location(div7, file, 58, 8, 2920);
    			attr_dev(div8, "class", "step-content svelte-br0mhb");
    			add_location(div8, file, 65, 10, 3339);
    			attr_dev(div9, "class", "step svelte-br0mhb");
    			toggle_class(div9, "active", /*value*/ ctx[0] === 4);
    			add_location(div9, file, 64, 8, 3283);
    			attr_dev(div10, "class", "step-content svelte-br0mhb");
    			add_location(div10, file, 68, 10, 3532);
    			attr_dev(div11, "class", "step svelte-br0mhb");
    			toggle_class(div11, "active", /*value*/ ctx[0] === 5);
    			add_location(div11, file, 67, 8, 3476);
    			add_location(p5, file, 72, 12, 3698);
    			add_location(p6, file, 73, 12, 3760);
    			attr_dev(div12, "class", "step-content svelte-br0mhb");
    			add_location(div12, file, 71, 10, 3659);
    			attr_dev(div13, "class", "step svelte-br0mhb");
    			toggle_class(div13, "active", /*value*/ ctx[0] === 6);
    			add_location(div13, file, 70, 8, 3603);
    			attr_dev(div14, "class", "spacer svelte-br0mhb");
    			add_location(div14, file, 75, 8, 3979);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, p0);
    			append_dev(p0, t0);
    			append_dev(p0, strong0);
    			append_dev(p0, t2);
    			append_dev(p0, strong1);
    			append_dev(p0, t4);
    			append_dev(p0, strong2);
    			append_dev(p0, t6);
    			append_dev(p0, strong3);
    			append_dev(p0, t8);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, p1);
    			append_dev(p1, t10);
    			append_dev(p1, strong4);
    			append_dev(div2, t12);
    			append_dev(div2, p2);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div6);
    			append_dev(div6, p3);
    			append_dev(p3, t17);
    			append_dev(p3, strong5);
    			append_dev(p3, t19);
    			append_dev(div6, t20);
    			append_dev(div6, p4);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div8);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div10);
    			insert_dev(target, t26, anchor);
    			insert_dev(target, div13, anchor);
    			append_dev(div13, div12);
    			append_dev(div12, p5);
    			append_dev(div12, t28);
    			append_dev(div12, p6);
    			insert_dev(target, t30, anchor);
    			insert_dev(target, div14, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*value*/ 1) {
    				toggle_class(div1, "active", /*value*/ ctx[0] === 0);
    			}

    			if (dirty & /*value*/ 1) {
    				toggle_class(div3, "active", /*value*/ ctx[0] === 1);
    			}

    			if (dirty & /*value*/ 1) {
    				toggle_class(div5, "active", /*value*/ ctx[0] === 2);
    			}

    			if (dirty & /*value*/ 1) {
    				toggle_class(div7, "active", /*value*/ ctx[0] === 3);
    			}

    			if (dirty & /*value*/ 1) {
    				toggle_class(div9, "active", /*value*/ ctx[0] === 4);
    			}

    			if (dirty & /*value*/ 1) {
    				toggle_class(div11, "active", /*value*/ ctx[0] === 5);
    			}

    			if (dirty & /*value*/ 1) {
    				toggle_class(div13, "active", /*value*/ ctx[0] === 6);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(div7);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(div9);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(div11);
    			if (detaching) detach_dev(t26);
    			if (detaching) detach_dev(div13);
    			if (detaching) detach_dev(t30);
    			if (detaching) detach_dev(div14);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(30:6) <Scrolly bind:value>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let section;
    	let div0;
    	let h10;
    	let t1;
    	let h2;
    	let t3;
    	let p0;
    	let t5;
    	let p1;
    	let t7;
    	let div3;
    	let div1;
    	let scrolly;
    	let updating_value;
    	let t8;
    	let div2;
    	let consensus;
    	let t9;
    	let div4;
    	let compareconsensus;
    	let t10;
    	let div5;
    	let h11;
    	let current;

    	function scrolly_value_binding(value) {
    		/*scrolly_value_binding*/ ctx[1](value);
    	}

    	let scrolly_props = {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	if (/*value*/ ctx[0] !== void 0) {
    		scrolly_props.value = /*value*/ ctx[0];
    	}

    	scrolly = new Scrolly({ props: scrolly_props, $$inline: true });
    	binding_callbacks.push(() => bind(scrolly, 'value', scrolly_value_binding));

    	consensus = new Consensus({
    			props: { step: /*value*/ ctx[0] },
    			$$inline: true
    		});

    	compareconsensus = new CompareConsensus({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Visualizing Consensus";
    			t1 = space();
    			h2 = element("h2");
    			h2.textContent = "By Hilson Shrestha and Kartik Nautiyal";
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "Decision making involves clashing of opinions of multiple stakeholders to reach a reasonable agreement between\n      them. One of such scenarios includes the use of rankings.";
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "In this visualization, we attempt to explain the level of agreement or disagreement in a consensus ranking, and\n      eventually compare between multiple consensus rakings.";
    			t7 = space();
    			div3 = element("div");
    			div1 = element("div");
    			create_component(scrolly.$$.fragment);
    			t8 = space();
    			div2 = element("div");
    			create_component(consensus.$$.fragment);
    			t9 = space();
    			div4 = element("div");
    			create_component(compareconsensus.$$.fragment);
    			t10 = space();
    			div5 = element("div");
    			h11 = element("h1");
    			h11.textContent = "Thanks!";
    			add_location(h10, file, 15, 4, 407);
    			attr_dev(h2, "class", "svelte-br0mhb");
    			add_location(h2, file, 16, 4, 442);
    			set_style(p0, "max-width", "800px");
    			add_location(p0, file, 17, 4, 494);
    			set_style(p1, "max-width", "800px");
    			add_location(p1, file, 22, 4, 717);
    			attr_dev(div0, "class", "hero svelte-br0mhb");
    			add_location(div0, file, 14, 2, 384);
    			attr_dev(div1, "class", "steps-container svelte-br0mhb");
    			add_location(div1, file, 28, 4, 980);
    			attr_dev(div2, "class", "sticky p-20 svelte-br0mhb");
    			add_location(div2, file, 78, 4, 4034);
    			attr_dev(div3, "class", "section-container svelte-br0mhb");
    			add_location(div3, file, 27, 2, 944);
    			add_location(div4, file, 82, 2, 4115);
    			add_location(h11, file, 86, 4, 4180);
    			attr_dev(div5, "class", "hero svelte-br0mhb");
    			add_location(div5, file, 85, 2, 4157);
    			add_location(section, file, 13, 0, 372);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(div0, h10);
    			append_dev(div0, t1);
    			append_dev(div0, h2);
    			append_dev(div0, t3);
    			append_dev(div0, p0);
    			append_dev(div0, t5);
    			append_dev(div0, p1);
    			append_dev(section, t7);
    			append_dev(section, div3);
    			append_dev(div3, div1);
    			mount_component(scrolly, div1, null);
    			append_dev(div3, t8);
    			append_dev(div3, div2);
    			mount_component(consensus, div2, null);
    			append_dev(section, t9);
    			append_dev(section, div4);
    			mount_component(compareconsensus, div4, null);
    			append_dev(section, t10);
    			append_dev(section, div5);
    			append_dev(div5, h11);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const scrolly_changes = {};

    			if (dirty & /*$$scope, value*/ 5) {
    				scrolly_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				scrolly_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			scrolly.$set(scrolly_changes);
    			const consensus_changes = {};
    			if (dirty & /*value*/ 1) consensus_changes.step = /*value*/ ctx[0];
    			consensus.$set(consensus_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scrolly.$$.fragment, local);
    			transition_in(consensus.$$.fragment, local);
    			transition_in(compareconsensus.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scrolly.$$.fragment, local);
    			transition_out(consensus.$$.fragment, local);
    			transition_out(compareconsensus.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(scrolly);
    			destroy_component(consensus);
    			destroy_component(compareconsensus);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let value;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function scrolly_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	$$self.$capture_state = () => ({
    		Scrolly,
    		Consensus,
    		CompareConsensus,
    		value
    	});

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, scrolly_value_binding];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
      props: {
        // name: 'world',
      },
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
