<?php
$newData = array();
if (isset($tplData)) {
if (!isset($newData['legoData'])) {
LegoMirrorUtil::set($newData, array('legoData'), array());
}
LegoMirrorUtil::set($newData['legoData'], array('title'), $tplData['title']);
LegoMirrorUtil::set($newData['legoData'], array('items', '0', 'component'), 'img-text-icon');
LegoMirrorUtil::set($newData['legoData'], array('items', '0', 'data', 'title'), '官方客服提示');
LegoMirrorUtil::set($newData['legoData'], array('items', '0', 'data', 'desc'), $tplData['text']);
LegoMirrorUtil::set($newData['legoData'], array('items', '1', 'component'), 'lego-entry');
if (isset($tplData['tellist'])) {
if (!empty($tplData['tellist']) && !isset($tplData['tellist'][0])) {
$tplData['tellist'] = array($tplData['tellist']);
}
foreach ($tplData['tellist'] as $i => $item) {
if (!isset($newData['legoData']['items']['1']['data'][$i])) {
LegoMirrorUtil::set($newData['legoData'], array('items', '1', 'data', $i), array());
}
LegoMirrorUtil::set($newData['legoData']['items']['1']['data'][$i], array('component'), 'img-text-icon');
LegoMirrorUtil::set($newData['legoData']['items']['1']['data'][$i], array('data', '0', 'title'), $tplData['tellist'][$i]['tel']['0']['hot']);
LegoMirrorUtil::set($newData['legoData']['items']['1']['data'][$i], array('data', '0', 'aaa'), 'tel');
LegoMirrorUtil::set($newData['legoData']['items']['1']['data'][$i], array('data', '0', 'url'), 'tel:' . $tplData['tellist'][$i]['tel']['0']['hot'] . 'abc ' . $tplData['tellist'][$i]['aa']['1']['sj'] . ' 666');
LegoMirrorUtil::set($newData['legoData']['items']['1']['data'][$i], array('data', '0', 'url2'), 'tel:' . $tplData['tellist'][$i]['tel']['0']['hot'] . 'abc ' . $tplData['tellist'][$i]['aa']['1']['sj'] . ' 666 {{ cc/2/kkk}} 777 ');
}
}
}