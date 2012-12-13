<?php


/**
 * Tags Widget for Contao
 *
 * @author Christoph Wiechert <wio@psitrax.de>
 * @copyright 4ward.media GbR <http://www.4wardmedia.de>
 * @package tagsWidget
 * @filesource
 * @licence LGPL
 */

class TagsWidget extends \Widget
{

	/**
	 * Submit user input
	 * @var boolean
	 */
	protected $blnSubmitInput = true;

	/**
	 * Template
	 * @var string
	 */
	protected $strTemplate = 'widget_tags';


	/**
	 * Trim values
	 * @param mixed
	 * @return mixed
	 */
	protected function validator($varInput)
	{
		if (is_array($varInput))
		{
			return parent::validator($varInput);
		}

		return parent::validator(trim($varInput));
	}


	/**
	 * Generate the widget and return it as string
	 * @return string
	 */
	public function generate()
	{
		// load autocompleter
		$GLOBALS['TL_JAVASCRIPT'][]  = 'system/modules/tagsWidget/html/mooTagify.js';
		$GLOBALS['TL_CSS'][''] 		= 'system/modules/tagsWidget/html/mooTagify.css';

		$this->loadLanguageFile('widget_tags');

	}
}