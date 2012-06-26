tagsWidget
=============

Tag widget with autocompleter for Contao WebCMS
based on http://mootools.net/forge/p/mootagify

Usage DCA
--------
```php
<?php
// tags field
$GLOBALS['TL_DCA']['tl_table']['fields']['tags'] = array
(
	'label'                   => &$GLOBALS['TL_LANG']['tl_table']['tags'],
	'exclude'                 => true,
	'inputType'				  => 'tags',
	'options_callback'		  => array('tl_table','getAllTags')
);
```

Contact, Licence
----------------
**Licence:** LGPL

**Author:** Christoph Wiechert, [4ward.media](http://www.4wardmedia.de)

