/*
---

name: mooTagify with auto suggest

description: provides an input for tags or labels

authors: Dimitar Christoff, Qmetric Group Limited

license: MIT-style license.

version: 1.1

requires:
  - Core/String
  - Core/Event
  - Core/Element
  - Core/Array
  - Core/Class
  - More/Element.Shorcuts
  - More/Fx.Scroll

provides: mooTagify

...
*/
// !function() {

Array.implement({

    unique: function(){
        return [].combine(this)
    }

})


var autoSuggest = new Class({
    // private

    Implements: [Options,Events],

    options: {
        width: 233,
        minChars: 2,
        wrapperZen: 'div.autocompleteWrapper',              // popup wrapper class
        wrapperShadow: 'boxShadow',                         // extra class applied to wrapper, like one with box-shadow
        maxHeight: 106,                                     // maximum allowed height for dropdown before it scrolls
        optionZen: 'div.autocompleteOption',                // base class of indivdual options
        optionClassSelected: 'autocompleteOptionSelected',  // pre-selected value class
        optionClassOver: 'autocompleteOptionOver',          // onmouseover option class
        highlightTemplate: '<span class="HL">{value}</span>',
        ajaxProperty: 'prefix'                              // it will pass on the typed value as prefix=NNNn
    },


    initialize: function(input, requestUrl, options)
	{
        this.setOptions(options)

        this.element = document.id(input);
        if (!this.element) return;

        this.requestUrl = requestUrl;
        this.buildList();
        this.attachEvents();
        this.index = -1;
        this.fireEvent('ready');
    },


    buildList: function()
	{
        var visible = this.element.isVisible();
        var size;

        if (!visible)
		{
            var clone = this.element.clone().setStyles({
                opacity: .01,
                position: 'absolute',
                top: -1000
            }).inject(document.body).show();

            size = clone.getSize();
            clone.destroy();
        }
        else
		{
            size = this.element.getSize();
        }

        var width = this.options.width || size.x - 2;
        var height = size.y;
        var self = this;

        this.wrapper = new Element(this.options.wrapperZen, {
            styles: {
                width: width,
                marginTop: height
            },
            events: {
                mouseenter: function()
				{
                    self.over = true;
                },
                mouseleave: function()
				{
                    self.over = false;
                },
                outerClick: function(e)
				{
                    if (!self.focused) self.hide();
                },
                'click:relay(div)': function(e)
				{
                    self.select(this.retrieve('index'));
                }
            }
        }).inject(this.element, 'before');

        this.wrapper.addClass(this.options.wrapperShadow);
        this.scrollFx = new Fx.Scroll(this.wrapper,
		{
            duration: 200
        });
    },


    attachEvents: function()
	{
        this.element.addEvents({
            keydown: this.handleKey.bind(this),
            keyup: this.handleText.bind(this),
            focus: this.handleText.bind(this),
            blur: this.blur.bind(this)
        }).setStyle('width', this.options.width - 3);

        var self = this;

        this.request =  new Request.JSON(
		{
			url: this.requestUrl,
			method: "get",
            timeout: 30000,
            link: 'cancel',
            onSuccess: function(data)
			{
				if(data && data.length)
				{
					// filter already set tags // by PsiTrax
					var choosenTags = self.options.mooTagify.getTags();
					data = Array.filter(data, function(option)
					{
						return !choosenTags.contains(option);
					});
				}

                if (data && data.length)
				{
                    self.show();
                    self.addOptions(data);
                }
                else
				{
                    self.clearOptions();
                    self.hide();
                }
            }
        });
    },


    addOptions: function(answers)
	{
        var self = this;


        this.wrapper.empty();
        this.answers = answers || [];
        this.answersOptions = new Elements();

        var val = {value: this.element.get('value').clean()};

        this.answers.each(function(option, index)
		{
            	self.addOption(option, val, index);
        })
    },


    addOption: function(option, val, index)
	{
        var matches = option.match(val.value, 'i');
        var value = option;
        var self = this;

        if (matches && matches.length)
		{
            matches.each(function(substring)
			{
                val.value = substring;
                value = option.replace(substring, self.options.highlightTemplate.substitute(val), 'ig');
            });
        }

        var opt = new Element(this.options.optionZen,
		{
            html: value
        }).inject(this.wrapper).store('index', index);

        index === this.index && opt.addClass(this.options.optionClassSelected);

        this.answersOptions.push(opt);

        if (this.options.maxHeight) // if greater than 0 care about this
		{
            this.wrapper.setStyle('height', 'auto');
            var height = this.wrapper.getSize().y;

            if (height >= this.options.maxHeight)
			{
                this.wrapper.setStyle('height', this.options.maxHeight);
            }

        }
    },


    handleKey: function(e)
	{
        switch(e.code)
		{
            case 8:
                // backspace.
                var len = e.target.get('value').clean();
                len.length || this.fireEvent('delete');
            break;

            case 40:
                e && e.stop();
                if (!this.answersOptions) break;

                if (this.answersOptions[this.index]) this.answersOptions[this.index].addClass(this.options.optionClassSelected);

                if (this.index < this.answersOptions.length - 1)
				{
                    this.answersOptions.removeClass(this.options.optionClassSelected);
                    this.index++;
                    this.answersOptions[this.index].addClass(this.options.optionClassSelected);
                }
                else
				{
                    this.answersOptions.removeClass(this.options.optionClassSelected);
                    this.index = 0;
                    if (!this.answersOptions[this.index]) break;

                    this.answersOptions[this.index].addClass(this.options.optionClassSelected);
                }
                this.scrollFx.toElement(this.answersOptions[this.index]);
                this.fireEvent('down');
                return;
            break;

            case 38:
                e && e.stop();
                if (!this.answersOptions) break;

                if (this.answersOptions[this.index]) this.answersOptions[this.index].addClass(this.options.optionClassSelected);

                if (this.index > 0)
				{
                    this.answersOptions.removeClass(this.options.optionClassSelected);
                    this.index--;
                    this.answersOptions[this.index].addClass(this.options.optionClassSelected);
                }
                else
				{
                    this.answersOptions.removeClass(this.options.optionClassSelected);
                    this.index = this.answersOptions.length - 1;
                    if (!this.answersOptions[this.index]) break;

                    this.answersOptions[this.index].addClass(this.options.optionClassSelected);
                }

                this.scrollFx.toElement(this.answersOptions[this.index]);
                this.fireEvent('up');
                return;
            break;

            case 13:
                e && e.preventDefault && e.preventDefault();

                if (this.index !== -1) this.select(this.index);
                else this.element.blur();
            break;
        }

    },

    handleText: function(e)
	{
        // it's where the ajax look ahead happens...
        if (e && e.code)
		{
            if ([38,40].contains(e.code)) return;
        }

        var val = this.element.get('value');
        if (val.length <= this.options.minChars)
		{
            this.hide();
            return;
        }

        var obj = {};
        obj[this.options.ajaxProperty] = val;
        this.request.get(obj);
    },


    clearOptions: function()
	{
        this.answers = [];
        this.answersOptions = new Elements();
        this.wrapper.empty();
        this.index = -1;
        this.hide();
    },


    select: function(index)
	{
        this.element.set('value', this.answers[index]).blur();
        this.clearOptions();
        this.fireEvent('select', index);
    },


    hide: function()
	{
        this.wrapper.setStyle('display', 'none');
    },


    show: function()
	{
        this.wrapper.setStyle('display', 'block');
        this.focused = true;
    },


    blur: function()
	{
        this.element.set('value', this.element.get('value').clean());
        this.focused = false;
        if (!this.over) this.hide();
    }

});


var mooTagify = this.mooTagify = new Class({

    Implements: [Options, Events],

    options: {
        /*
        onReady: Function.From,
        onLimitReached: function(rejectedTag) {},
        onInvalidTag: function(rejectedTag) {},
        onTagsUpdate: Function.From,
        onTagRemove: function(tagText) {},
        */
        tagEls: 'div.tag',
        minItemLength: 3,
        maxItemLength: 16,
        maxItemCount: 10,
        persist: true,
        autoSuggest: false,
        addOnBlur: true,
        caseSensitiveTagMatching: false /* set to true, to keep case as entered */
    },


    initialize: function(element, requestUrl, options)
	{
        this.element = document.id(element);
        if (!this.element) return;

        this.requestUrl = requestUrl;
        this.setOptions(options);

        this.listTags = this.element.getElement('input,textarea');
        if (!this.listTags) return;

        this.attachEvents();
    },


    attachEvents: function()
	{
        var self = this;
        if (this.options.autoSuggest && this.requestUrl)
		{
            this.autoSuggester = new autoSuggest(this.element.getElement('input'), this.requestUrl,
			{
                onDelete: function()
				{
                    var last = self.element.getElements(self.options.tagEls).getLast();
                    last && self.element.fireEvent('click', {
                        target: last.getElement('span.tagClose')
                    });
                },
				mooTagify: this
            });
        }

        this.clicked = false;

        var eventObject = {
            'blur:relay(input)': this.extractTags.bind(this),
            'click:relay(span.tagClose)': this.removeTag.bind(this),
            'mousedown': function()
			{
                self.clicked = true
            },
            'mouseup': function()
			{
                self.clicked = false
            },
            'keydown:relay(input)': function(e, el)
			{
                if (e.key == 'enter')
				{
                    if (self.options.addOnBlur)
					{
                        el.blur();
                    }
                    else
					{
                        self.extractTags() && e.stop();
                    }
                }
            }
        };

        this.options.addOnBlur || (delete eventObject['blur:relay(input)']);
        this.element.addEvents(eventObject);
        this.fireEvent('ready');
    },


    extractTags: function()
	{
        var self = this;
        var check = function()
		{
			if (self.clicked) return false;

			clearInterval(this.timer);

			var newTags = self.listTags.get('value').clean().stripScripts();
			self.options.caseSensitiveTagMatching || (newTags = newTags.toLowerCase());

			if (newTags.length)
			{

				self.processTags(newTags);

				if(self.options.persist)
				{
					(function(){
						self.listTags.focus();
					}).delay(10,self.listTags);
				}

			}
			self.options.autoSuggest && self.autoSuggester.hide();
			return true;
		};

        clearInterval(this.timer);

        check() || (this.timer = check.periodical(200));

        return this;
    },


    processTags: function(tags)
	{
        // called when blurred tags entry, rebuilds hash tags preview
        clearInterval(this.timer);

        var tagsArray = tags.split(',').map(function(el)
		{
            el = el.trim();
            return el;
        }).unique();

        var target = this.element.getFirst();

        if (tagsArray.length)
		{
            this.listTags.set('value', '');
            var orig = this.getTags() || [];
            tagsArray = orig.append(tagsArray).unique();

            /* remove tags that only differ in case */
            var tempArray = [];
            tagsArray.each(function(tag)
			{
                var found = tempArray.some(function(item)
				{
                    return item.toLowerCase() == tag.toLowerCase();
                });
                if (!found)
				{
                    tempArray.push(tag);
                }
            });
            tagsArray = tempArray;

            target.empty();
            var done = 0, added = [];
            Array.each(tagsArray, function(el)
			{
                this.options.caseSensitiveTagMatching || (el = el.toLowerCase());

                if (done >= this.options.maxItemCount)
				{
                    this.fireEvent('limitReached', el);
                    return;
                }

                if (el.length >= this.options.minItemLength && el.length < this.options.maxItemLength)
				{
                    new Element([this.options.tagEls, '[html=', el, '<span class="tagClose"></span>]'].join('')).inject(target);
                    done++;
                    added.push(el);
                }
                else
				{
                    this.fireEvent('invalidTag', el);
                }
            }, this);
            this.fireEvent('tagsUpdate', added);
        }
    },


    removeTag: function(e)
	{
        var tag = e.target.getParent();
        var tagText = tag.get('text');

        this.options.caseSensitiveTagMatching || (tagText = tagText.toLowerCase());

        tag.destroy();
        this.fireEvent('tagRemove', tagText);
        clearTimeout(this.timer);
        this.options.persist && this.listTags.focus.delay(10, this.listTags);
    },


    getTags: function()
	{
        // return an array of entered tags.
        var els = this.element.getElements(this.options.tagEls);
        return (els.length) ? els.get('text') : [];
    }
});

// }()