import { basicInfo } from './config/index';
import { createNewDraft, saveDraft, importImage, importAudio, importVideo, addImageToTrack } from './draftUtil';

export const init = () => {
    const savePath = basicInfo.draftRoot;
    // const savePath = '/Users/wangzidong/Movies/JianyingPro/User\ Data/Projects/com.lveditor.draft';

    const draft = createNewDraft({
        name: 'myDraft1',
        savePath,
    });

    // importImage(draft, '/Users/wangzidong/Downloads/1_face.png', '1.png');
    // importVideo(draft, '/Users/wangzidong/Downloads/1.mp4', '1.mp4');
    // importAudio(draft, '/Users/wangzidong/Downloads/1.mp4', '111.mp3');
    const trackData = addImageToTrack(draft, {
        imgFilePath: '/Users/wangzidong/Downloads/1_face.png',
        imgName: '1.png',
        timerange: {
            start: 0,
            duration: 2000000,
        }
    });
    addImageToTrack(draft, {
        trackData,
        imgFilePath: '/Users/wangzidong/Downloads/2_face.png',
        imgName: '2.png',
        timerange: {
            start: 2000000,
            duration: 3000000,
        }
    });

    saveDraft(draft);
}