<?php

/**
 * @copyright 4ward.media 2012 <http://www.4wardmedia.de>
 * @author Christoph Wiechert <wio@psitrax.de>
 */


// Register the classes
ClassLoader::addClasses(array
(
	'TagsWidget' 	=> 'system/modules/tagsWidget/TagsWidget.php',
));

// Register the templates
TemplateLoader::addFiles(array
(
	'widget_tags' 					=> 'system/modules/tagsWidget/templates',
));
