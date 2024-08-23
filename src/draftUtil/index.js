import { basicInfo } from '../config/index';
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

let _draftTpl;
const giveMeDraftFromTpl = () => {
    if (!_draftTpl) {
        const draftInfo = JSON.parse(fs.readFileSync(basicInfo.draftInfoTpl, 'utf-8'));
        const draftMetaInfo = JSON.parse(fs.readFileSync(basicInfo.draftMetaInfoTpl, 'utf-8'));
        _draftTpl = {
            draftInfo,
            draftMetaInfo,
        };
    }
    return JSON.parse(JSON.stringify(_draftTpl));

}

let _videoItemTpl;
const giveMeVideoItemFromTpl = () => {
    if (!_videoItemTpl) {
        _videoItemTpl = JSON.parse(fs.readFileSync(basicInfo.videoItemTpl, 'utf-8'));
    }
    return JSON.parse(JSON.stringify(_videoItemTpl));
}

let _trackItemTpl;
const giveMeTrackItemFromTpl = () => {
    if (!_trackItemTpl) {
        _trackItemTpl = JSON.parse(fs.readFileSync(basicInfo.trackItemTpl, 'utf-8'));
    }
    return JSON.parse(JSON.stringify(_trackItemTpl));
}

let _segmentItemTpl;
const giveMeSegmentItemFromTpl = () => {
    if (!_segmentItemTpl) {
        _segmentItemTpl = JSON.parse(fs.readFileSync(basicInfo.segmentItemTpl, 'utf-8'));
    }
    return JSON.parse(JSON.stringify(_segmentItemTpl));
}

let _segmentItemCommonKeyFramesTpl;
const giveMeSegmentItemCommonKeyFramesFromTpl = () => {
    if (!_segmentItemCommonKeyFramesTpl) {
        _segmentItemCommonKeyFramesTpl = JSON.parse(fs.readFileSync(basicInfo.segmentItemCommonKeyFramesTpl, 'utf-8'));
    }
    return JSON.parse(JSON.stringify(_segmentItemCommonKeyFramesTpl));
}


const uuid = () => {
    return uuidv4().toLocaleUpperCase();
}

/**
 * 
 * @param {*} draftName 草稿名称
 * 
 * 定义一下draft对象
 * {
 *  draftInfo:{},
 *  draftMetaInfo:{},
 *  savePath:'', // 最终保存路径
 *  resourcePath:'', //资源文件夹
 *  resourceList:[], //资源映射列表关系
 *  resourceMap:{}, //资源映射MAP 主要用来判断是否存在
 * }
 * 
 */
export const createNewDraft = ({
    name: draftName,
    canvas = { width: 1080, height: 1920 },
    savePath = basicInfo.draftRoot
}) => {
    const newDraft = giveMeDraftFromTpl();
    newDraft.savePath = savePath;
    newDraft.resourcePath = path.join(savePath, draftName, 'resource');
    newDraft.resourceList = [];
    newDraft.resourceMap = {};

    const draftMetaInfo = newDraft.draftMetaInfo;
    draftMetaInfo.draft_name = draftName;
    draftMetaInfo.draft_fold_path = path.join(savePath, draftName);
    draftMetaInfo.draft_id = uuid();


    const draftInfo = newDraft.draftInfo;
    draftInfo.canvas_config.width = canvas.width;
    draftInfo.canvas_config.height = canvas.height;
    draftInfo.id = uuid();

    return newDraft;
}

const currentTime = () => {
    return Math.floor(Date.now() / 1000);
}
/**
 * 
 * @param {*} draft 草稿对象
 * @param {*} resourcePath 要引入的资源文件路径
 * @param {*} name 引入资源文件名
 * @param {*} type 资源类型 0 图片 视频 1 音频
 * @param {*} options 其他参数 会...到最后 优先级高于默认逻辑 比如可以设置 duration 和 width height
 * 
 * 修改draft对象
 * 将资源cp到草稿目录下对应目录下
 * 
 */
const importResource = (draft, resourceFilePath, name, type, options) => {
    // 先检查资源是否已经添加过
    const key = `${resourceFilePath}${name}`;
    if (draft.resourceMap[key]) {
        return;
    }


    const draftMetaInfo = draft.draftMetaInfo;
    const draftMaterial = draftMetaInfo['draft_materials'].find(item => item.type === type)
    const resFilePath = path.join(draft.resourcePath, name);

    const resourceList = draft.resourceList;
    // save时需要进行cp操作
    const value = {
        key,
        src: resourceFilePath,
        desSrc: resFilePath,
    }
    draft.resourceMap[key] = value;
    resourceList.push(value);

    draftMaterial.value.push(
        {
            "create_time": currentTime(),
            "duration": 6000000,
            "extra_info": name,
            "file_Path": resFilePath,
            "height": 500,
            "id": uuid(),
            "import_time": currentTime(),
            "import_time_ms": Date.now() * 1000,
            "item_source": 1,
            "md5": "",
            "metetype": "photo",
            "roughcut_time_range": {
                "duration": -1,
                "start": -1
            },
            "sub_time_range": {
                "duration": -1,
                "start": -1
            },
            "type": 0,
            "width": 500,
            ...options
        }
    )

    return resFilePath;
}

/**
 * 
 * @param {*} draft 草稿对象
 * @param {*} imgFilePath 要引入的资源文件路径
 * @param {*} imgName 引入资源文件名
 * 
 * 修改draft对象
 * 将资源cp到草稿目录下对应目录下
 * 
 */
export const importImage = (draft, imgFilePath, imgName) => {
    // todo 获取图片宽高
    return importResource(draft, imgFilePath, imgName, 0, {
        metetype: 'photo'
    });
}

export const importVideo = (draft, videoFilePath, videoName) => {
    // todo 获取视频宽高和时长
    return importResource(draft, videoFilePath, videoName, 0, {
        metetype: 'video'
    });
}

export const importAudio = (draft, audioFilePath, audioName) => {
    // todo 获取音频时长 这里也可以用mp4
    return importResource(draft, audioFilePath, audioName, 1, {
        metetype: 'none'
    });
}



const newCanvasWithDraft = () => {
    return {
        "album_image": "",
        "blur": 0.0,
        "color": "",
        "id": uuid(),
        "image": "",
        "image_id": "",
        "image_name": "",
        "source_platform": 0,
        "team_id": "",
        "type": "canvas_color"
    };

}
const newSoundChannelMappingWithDraft = () => {
    return {
        "audio_channel_mapping": 0,
        "id": uuid(),
        "is_config_open": false,
        "type": ""
    };
}
const newSpeedsWithDraft = () => {
    return {
        "curve_speed": null,
        "id": uuid(),
        "mode": 0,
        "speed": 1.0,
        "type": "speed"
    }
}
const newVocalSeparationWithDraft = () => {
    return {
        "choice": 0,
        "id": uuid(),
        "production_path": "",
        "time_range": null,
        "type": "vocal_separation"
    }
}

const newVideoItemWithDraft = (resFilePath) => {
    const videoItemData = giveMeVideoItemFromTpl();
    // 替换一些字段
    videoItemData['id'] = uuid();
    videoItemData['path'] = resFilePath
    return videoItemData;
}

const addImageToMaterials = (draft, resFilePath) => {
    // 添加videos
    const videoItemData = newVideoItemWithDraft(resFilePath);
    draft.draftInfo.materials.videos.push(videoItemData);
    return videoItemData
}

/**
 * 向 materifals 的videos canvas sound_channel_mappings speeds vocal_separation添加素材
 * @param {*} draft 
 * @param {*} resFilePath 资源路径
 */
const newTrackResource = (draft) => {

    // 添加canvas
    const canvasData = newCanvasWithDraft();
    draft.draftInfo.materials.canvases.push(canvasData);
    // 添加sound_channel_mappings
    const soundChannelMappingData = newSoundChannelMappingWithDraft();
    draft.draftInfo.materials.sound_channel_mappings.push(soundChannelMappingData);
    // 添加speeds
    const speedData = newSpeedsWithDraft();
    draft.draftInfo.materials.speeds.push(speedData);
    // 添加vocal_separation
    const vocalSeparationData = newVocalSeparationWithDraft();
    draft.draftInfo.materials.vocal_separations.push(vocalSeparationData);

    return {
        canvasData,
        soundChannelMappingData,
        speedData,
        vocalSeparationData
    }
}

const newMaterialsTrack = (type, trackResouceData) => {
    const trackItemData = giveMeTrackItemFromTpl();
    // 给trackItemData赋值
    trackItemData.id = uuid();
    trackItemData.type = type;

    return { trackItemData, trackResouceData };

}


/**
 * 
 * @returns 返回一个map 用来方便设置每种类型的关键帧 同时返回commonKeyframeItemList 用来更新segmentItemCommonKeyFrames
 */
const newSegmentCommonKeyframesData = () => {
    const segmentItemCommonKeyFramesData = giveMeSegmentItemCommonKeyFramesFromTpl();
    const commonKeyframeItemMap = {};
    segmentItemCommonKeyFramesData.forEach(item => {
        item.id = uuid();
        commonKeyframeItemMap[item.property_type] = item;
    });
    return { segmentItemCommonKeyFramesData, commonKeyframeItemMap };
}

const newKeyframeListItem = (keyFrameSimpleData) => {
    const { timeOffset = 0, values = [0] } = keyFrameSimpleData;
    return {
        "curveType": "Line",
        "graphID": "",
        "id": uuid(),
        "left_control": {
            "x": 0.0,
            "y": 0.0
        },
        "right_control": {
            "x": 0.0,
            "y": 0.0
        },
        "time_offset": timeOffset,
        values,
    }
}

/**
 * 
 * @param {*} commonKeyframeItemMap newSegmentCommonKeyframesData返回的map
 * @param {*} propertyType 枚举值 KFTypeScaleX KFTypeRotation KFTypePositionX KFTypePositionY
 * @param {*} keyFrameSimpleDataList 
 * {
 *  time_offset: 时间点,
 *  value: 值, 时间点对应的值
 * }[]
 */
const setKeyFrameListByType = (commonKeyframeItemMap, propertyType, keyFrameSimpleDataList) => {
    const segmentItemCommonKeyFramesTypeData = commonKeyframeItemMap[propertyType];
    const keyframeList = keyFrameSimpleDataList.map(item => newKeyframeListItem(item))
    segmentItemCommonKeyFramesTypeData['keyframe_list'] = keyframeList;
}


const newSegmentData = (trackResouceData, videoItemData, timerange) => {
    const segmentItemData = giveMeSegmentItemFromTpl();
    segmentItemData.id = uuid();
    segmentItemData['material_id'] = videoItemData.id;
    segmentItemData['extra_material_refs'].push(trackResouceData.speedData.id);
    segmentItemData['extra_material_refs'].push(trackResouceData.canvasData.id);
    segmentItemData['extra_material_refs'].push(trackResouceData.soundChannelMappingData.id);
    segmentItemData['extra_material_refs'].push(trackResouceData.vocalSeparationData.id);
    segmentItemData['target_timerange'] = timerange
    return segmentItemData;
}




/**
 * 
 * @param {*} draft 草稿对象
 * @param {*} options 轨道参数
 * {
 *  trackData 可以为空 如果为空会新建一个轨道 如果传了 则会将图片资源添加到传入的轨道上
 *  imgFilePath 资源图片路径
 *  imgName 资源图片的名称
 *  timerange 资源展示的时间段 这个最好传 如果不传默认是5s
 *  keyFrameInfo 关键帧信息
 *  [
 *      {
 *          timeOffset: 时间点,
 *          keyframe:{
 *              scale: 1.2, //放缩状态
 *              rotation: 0, //旋转角度
 *              x:0, //原始位置坐标x
 *              y:0  //原始位置坐标y
 *          }
 *      }
 *  ]
 * }
 * @returns 
 */
export const addImageToTrack = (draft, {
    trackData,
    imgFilePath,
    imgName,
    timerange = { start: 0, duration: 5 },
    keyFrameInfo = {},
}) => {
    // 先引入资源
    const resFilePath = importImage(draft, imgFilePath, imgName);
    const videoItemData = addImageToMaterials(draft, resFilePath);
    // 添加轨道资源
    let trackDataIn = trackData;
    if (!trackDataIn) {
        // 资源添加到Materials
        const trackResouceData = newTrackResource(draft);
        trackDataIn = newMaterialsTrack('video', trackResouceData);
    }
    const segmentData = newSegmentData(trackDataIn.trackResouceData, videoItemData, timerange);
    trackDataIn.trackItemData.segments.push(segmentData);
    draft.draftInfo.tracks.push(trackDataIn.trackItemData);
    return trackDataIn;
}

/**
 * 
 * @param {*} draft 草稿对象
 * @param {*} duration 设置最后影片时长 应该是多个轨道时长的最大值，这里暂时直接从外部设置
 */
export const setDraftDuration = (draft, duration) => {
    draft.draftInfo.duration = duration * 1000000;
}


const createDir = (dirPath) => {
    try {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log('目录创建成功');
    } catch (err) {
        console.error('创建目录失败:', err);
    }
}

const writeJsonFile = (filePath, data) => {
    const jsonData = JSON.stringify(data, null, 2);
    try {
        // 同步写入文件
        fs.writeFileSync(filePath, jsonData, 'utf-8');
        console.log(filePath, '文件写入成功');
    } catch (err) {
        console.error('写入文件失败:', err);
    }
}


const execResourceFiles = (resourceList) => {
    for (let i = 0; i < resourceList.length; i++) {
        const item = resourceList[i];
        const { src, desSrc } = item;
        try {
            // 同步复制文件
            fs.copyFileSync(src, desSrc);
            console.log(src, '文件复制成功');
        } catch (err) {
            console.error('复制文件失败:', err);
        }
    }
}

/**
 * 
 * @param {*} draft 草稿对象
 * @param {*} path 草稿的保存位置
 */
export const saveDraft = (draft) => {
    // 创建目标路径
    const desPath = draft.savePath;
    const draftName = draft.draftMetaInfo.draft_name;
    const savePath = path.join(desPath, draftName);
    console.log('创建草稿路径', savePath);
    createDir(savePath);

    // 创建目标文件
    const draftMetaInfoPath = path.join(savePath, 'draft_meta_info.json');
    const draftInfoPath = path.join(savePath, 'draft_info.json');
    writeJsonFile(draftMetaInfoPath, draft.draftMetaInfo);
    writeJsonFile(draftInfoPath, draft.draftInfo);
    console.log('写入草稿meta文件---', draftMetaInfoPath);
    console.log('写入草稿info文件---', draftInfoPath);

    // 处理素材文件
    console.log('处理素材文件');
    const resourcePath = draft.resourcePath;
    createDir(resourcePath);
    const resourceList = draft.resourceList || [];
    execResourceFiles(resourceList);

    console.log(`${draftName}草稿保存在,${savePath}`);
}