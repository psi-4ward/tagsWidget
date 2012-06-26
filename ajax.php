<?php
/**
* Initialize the system
*/
define('TL_MODE', 'BE');
define('BYPASS_TOKEN_CHECK',true);
require_once('../../initialize.php');

class TagsWidgetResponder extends Controller
{
	public function __construct()
	{
		parent::__construct();
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
		$temp = $this->prepareForWidget($dca, $this->fld, '', null, $this->tbl);

		// reformat options for Autocompleter-JS and unique values
		$arrVals = array();
		foreach($temp['options'] as $val)
		{
			$arrVals[] = $val['label'];
		}
		unset($temp);

		// filter the array to return only matching elements
		$search = $this->Input->get('prefix');
		$arrRet = array_filter($arrVals,function($val) use($search){
			return strripos($val, $search) !== false;
		});
		
		echo json_encode(array_values($arrRet));
		
	}
}

$x = new TagsWidgetResponder();
