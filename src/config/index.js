const path = require('path');
const currentDirectory = process.cwd();
console.log(`当前工作目录是: ${currentDirectory}`);
export const basicInfo = {
    draftRoot: '/Users/wangzidong/Movies/CapCut/User Data/Projects/com.lveditor.draft',
    draftMetaInfoTpl: path.join(currentDirectory, 'src', '/template/draft_meta_info.json'),
    draftInfoTpl: path.join(currentDirectory, 'src', '/template/draft_info.json'),
    videoItemTpl: path.join(currentDirectory, 'src', '/template/video_item.json'),
    trackItemTpl: path.join(currentDirectory, 'src', '/template/track_item.json'),
    segmentItemTpl: path.join(currentDirectory, 'src', '/template/segment_item.json'),
}