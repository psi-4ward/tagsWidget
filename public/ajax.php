<?php

/**
* Initialize the system
*/
$dir = __DIR__;

while($dir != '.' && $dir != '/' && !is_file($dir.'/system/initialize.php'))
{
	$dir = dirname($dir);
}

if(!is_file($dir.'/system/initialize.php'))
{
	echo 'Could not find initialize.php!';
	exit(1);
}

define('TL_MODE', 'BE');
require($dir.'/system/initialize.php');


class TagsWidgetResponder extends \Controller
{

	public function __construct()
	{
		$this->import('BackendUser', 'User');
		parent::__construct();

		$this->User->authenticate();
		System::loadLanguageFile('default');

		$this->import('Database');
		
		// little validation
		$this->tbl = $this->Input->get('tbl');
		$this->fld = $this->Input->get('fld');
		if(!preg_match('~^[a-z0-9_\-]+$~i',$this->tbl)) die('ERROR 201');
		if(!preg_match('~^[a-z0-9_\-]+$~i',$this->fld)) die('ERROR 202');
		
		// load the DCA
		$this->loadDataContainer($this->tbl);
		$dca = $GLOBALS['TL_DCA'][$this->tbl]['fields'][$this->fld];

		// let the Controller::prepareForWidget calc the options
		$temp = \Widget::getAttributesFromDca($dca, $this->fld, '', null, $this->tbl);

		// reformat options for Autocompleter-JS and unique values
		$arrVals = array();
		foreach($temp['options'] as $val)
		{
			$arrVals[] = $val['label'];
		}
		unset($temp);

		// filter the array to return only matching elements
		$search = $this->Input->get('prefix');
		$arrRet = array_filter($arrVals, function($val) use($search) {
			return strripos($val, $search) !== false;
		});
		
		echo json_encode(array_values($arrRet));
		
	}
}

$x = new TagsWidgetResponder();
