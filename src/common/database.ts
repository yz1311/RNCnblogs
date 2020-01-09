export const tables = {
  blog: 'Blog',
  news: 'News',
  question: 'Question',
  user: 'user',
};

export const blogSchema = {
  name: tables.blog,
  primaryKey: 'id',
  properties: {
    id: 'string',
    url: 'string',
    author: 'string',
    avator: 'string',
    blogApp: 'string',
    title: 'string',
    description: 'string',
    diggComment: 'int',
    commentCount: 'int',
    viewCount: 'int',
    postDate: 'date',
    fetchDate: 'date',
    content: 'string?',
    //博客类型,1为个人博客，2为首页博客，3为精华博客,4为知识库
    blogType: 'int',
    //上次浏览的位置
    scrollPosition: {type: 'double', default: 0},
  },
};

export const newsSchema = {
  name: tables.news,
  primaryKey: 'id',
  properties: {
    id: 'string',
    url: 'string',
    author: 'string',
    avator: 'string',
    topicIcon: 'string',
    topicId: 'string',
    title: 'string',
    description: 'string',
    diggComment: 'int',
    commentCount: 'int',
    viewCount: 'int',
    postDate: 'date',
    fetchDate: 'date',
    content: 'string?',
    //博客类型,1为最新新闻，2为推荐新闻，3为本周热门
    newsType: 'int',
    //上次浏览的位置
    scrollPosition: {type: 'double', default: 0},
  },
};

export const questionSchema = {
  name: tables.question,
  primaryKey: 'id',
  properties: {
    id: 'string',
    url: 'string',
    author: 'string',
    Award: 'int',
    avator: 'string',
    topicIcon: 'string',
    topicId: 'string',
    title: 'string',
    description: 'string',
    answerComment: 'int',
    diggComment: 'int',
    commentCount: 'int',
    viewCount: 'int',
    postDate: 'date',
    fetchDate: 'date',
    content: 'string?',
    //博客类型,1为最新新闻，2为推荐新闻，3为本周热门
    newsType: 'int',
    //上次浏览的位置
    scrollPosition: {type: 'double', default: 0},
  },
};

export const userSchema = {
  name: tables.user,
  primary: 'id',
  properties: {
    id: 'string',
    alias: 'string?',
    displayName: 'string',
    guid: 'string?',
    iconUrl: 'string',
  },
};

export default {
  tables,
  blogSchema,
  newsSchema,
  userSchema,
};
