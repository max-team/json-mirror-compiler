<?php

/**
 * 数据映射工具函数集
 *
 * @class LegoMirrorUtil
 */
class LegoMirrorUtil {

    /**
     * 根据 pointer 获取值
     *
     * @param {array} $obj
     * @param {array} $path
     */
    static function get($obj, $path = array()) {
        if (!isset($obj)) {
            return;
        }
        $key = array_shift($path);
        while ($key) {
            if (!isset($obj) || !isset($obj[$key])) {
                return;
            }
            $obj = $obj[$key];
            $key = array_shift($path);
        }
        return $obj;
    }

    /**
     * 设置 pointer 获取值
     *
     * @param {array} $obj
     * @param {array} $path
     */
    static function set(&$obj, $path = array(), $value = null) {

        $len = count($path);

        $ret = &$obj;

        for ($i = 0; $i < $len; $i++) {
            $key = $path[$i];
            if (!is_array($ret)) {
                $ret = array();
                $ret[$key] = "";
            }
            $ret = &$ret[$key];
        }

        $ret = $value;
    }
}
