

export const contentHtmlTemplate = ({title, avatar, userName, dateDesc, body, scrollPosition, commentHtml}:
                                {
                                    title:string;
                                    avatar:string;
                                    userName: string;
                                    dateDesc: string;
                                    body: string;
                                    scrollPosition: number;
                                    commentHtml: string;
                                })=>{
    return `
        <html>
            <head>
            <meta name="viewport" content="width=device-width,initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
            <link rel="stylesheet" href="https://www.cnblogs.com/css/blog-common.min.css?v=${new Date().getTime()}">
            <style type="text/css">
                img {
                    height: auto;
                    width: auto;
                    max-width: 100%;
                }
                 pre {
                    background-color: #f5f5f5;
                    font-family: Courier New!important;
                    font-size: 12px!important;
                    line-height: 1.5 !important;
                    border: 1px solid #ccc;
                    padding: 5px;
                    overflow: auto;
                    margin: 5px 0;
                    color: #000;
                }
                /*p {*/
                    /*word-break:normal;*/
                    /*white-space: pre-warp;*/
                    /*word-wrapL:break-word;*/
                /*}*/
            </style>
            <script src="https://common.cnblogs.com/highlight/10.3.1/highlight.min.js"></script>
            <script>
                window.onload = function(){
                    var imgs = document.getElementsByTagName("img");
                    for (let i=0;i<imgs.length;i++) {
                        imgs[i].onclick = function(){
                            window['ReactNativeWebView'].postMessage(JSON.stringify({
                                type: 'img_click',
                                url: imgs[i].src
                            }))
                        }
                    }
                    var links = document.getElementsByTagName("a");
                    for (let i=0;i<links.length;i++) {
                        links[i].onclick = function(){
                            window['ReactNativeWebView'].postMessage(JSON.stringify({
                                type: 'link_click',
                                url: links[i].href
                            }));
                            return false;
                        }
                    }
                    /*记录滚动位置*/
                    window.onscroll = function() {
                        var scrollPos = window.scrollY || window.scrollTop || document.getElementsByTagName("html")[0].scrollTop;
                        try {
                            window['ReactNativeWebView'].postMessage(JSON.stringify({
                            type: 'scroll_position',
                            value: scrollPos
                            }));
                        } catch (error) {

                        }
                    }
                    if(${scrollPosition} > 0)
                    {
                       window.scrollTo(0,${scrollPosition});
                    }
                };
            </script>
            </head>
            <body style="padding: 0px;margin: 10px;">
                <div><div><h3>${title}</h3>
                <div style="display: flex;flex-direction: row;align-items: center">
                    <img style="width: 35px;height: 35px;object-fit: contain;"  src="${avatar}" />
                    <div style="display: flex;flex-direction: column;font-size: 12px;margin-left: 12px;flex:1;">
                        <span style="color:#000000;font-size:15px;">${userName}</span>
                        <span style="color:#777777;margin-top: 3px;">${dateDesc}</span>
                    </div>
                </div>
                </div>${body}</div>
                <div style="background-color: #f2f2f2;padding: 10px;color: #666;font-size: medium;margin: 10px -8px 10px -8px;">评论列表</div>
                ${commentHtml}
            </body>
            <script>hljs.initHighlightingOnLoad();</script>
        </html>
    `;
}


export const commentHtmlTemplate = ({avatar, Floor, userName, content, dateDesc}: {
    avatar: string;
    Floor: number;
    userName: string;
    content: string;
    dateDesc: string;
})=>{
    return `
        <div style="display: flex; flex-direction: row;padding-top: 10px;">
            <img
                style="width: 40px;height: 40px; border-radius: 20px;border-width: 1px;border-color: #999999;"
                src="${avatar ||
'https://pic.cnblogs.com/avatar/simple_avatar.gif'}" />
            <div style="display: flex; margin-left: 10px;flex-direction: column;flex: 1;">
                <span style="font-weight: bold;">
                    <span style="color: salmon;">#${Floor}楼</span>&nbsp;&nbsp;
                    <span>${userName}</span>
                </span>
                <span style="font-size: 15px;color: #666666;margin-top: 8px;">${content}</span>
                <span style="font-size: 15px;color: #999999;margin-top: 8px;">${dateDesc}</span>
                <div style="height: 1px;background-color: #999999;margin-top: 10px;"></div>
            </div>
        </div>
    `;
}

export const commentEmptyHtmlTemplate = ()=>{
    return `
        <div style="margin-top: 30px;min-height: 80px;display: flex;flex-direction: column;align-items: center;color:#666666;">-- 暂无评论 --</div>
    `;
}

export const commentMoreHtmlTemplate = ({color}: {color:string})=>{
    return `
        <div
            onclick="window['ReactNativeWebView'].postMessage(JSON.stringify({
                type: 'loadMore'
            }))"
            style="display: flex;height: 50px;justify-content: center;align-items: center;">
            <span style="color:${color};font-size: medium;">点击查看全部评论</span>
        </div>
    `;
}
