import * as actionTypes from '../../actions/actionTypes';
import {
  handleActions,
  createReducerResult,
  actionToResult,
  SagaAction,
  reducerModel,
} from '../../utils/reduxUtils';
import StringUtils from '../../utils/stringUtils';
import {
  blogCommentModel,
  blogModel,
  getBlogCommentListRequest,
  getBlogDetailRequest,
} from '../../api/blog';

export interface State {
  personalBlogList: Array<blogModel>;
  getPersonalBlogListResult: any;
  personalBlogList_pageIndex: number;
  personalBlogList_pageSize: number;
  personalBlogList_noMore: boolean;
  pickedBlogLis: Array<blogModel>;
  getPickedBlogListResult: any;
  pickedBlogLis_pageIndex: number;
  pickedBlogLis_noMore: boolean;
  homeBlogList: Array<blogModel>;
  getHomeBlogListResult: any;
  homeBlogList_pageIndex: number;
  homeBlogList_noMore: boolean;
  followingBlogList: Array<blogModel>;
  getFollowingBlogListResult: any;
  followingBlogList_pageIndex: number;
  followingBlogList_noMore: boolean;
  personBlogList: Array<blogModel>;
  getPersonBlogListResult: any;
  personBlogList_pageIndex: number;
  //不确定
  personBlogList_pageSize: number | undefined;
  personBlogList_noMore: boolean;
  blogDetail: any;
  getBlogDetailResult: any;
  blogDetails: {[key: string]: reducerModel<any>};
  selectedBlog: blogModel;
  blogCommentLists: {[key: string]: reducerModel<blogCommentModel>};
  blogCommentList: Array<blogCommentModel>;
  blogCommentList_noMore: boolean;
  getBlogCommentListResult: any;
}

const initialState = {
  personalBlogList: [],
  getPersonalBlogListResult: createReducerResult(),
  personalBlogList_pageIndex: 1,
  personalBlogList_pageSize: 1,
  personalBlogList_noMore: false,
  pickedBlogLis: [],
  getPickedBlogListResult: createReducerResult(),
  pickedBlogLis_pageIndex: 1,
  pickedBlogLis_noMore: false,
  homeBlogList: [],
  getHomeBlogListResult: createReducerResult(),
  homeBlogList_pageIndex: 1,
  homeBlogList_noMore: false,
  followingBlogList: [],
  getFollowingBlogListResult: createReducerResult(),
  followingBlogList_pageIndex: 1,
  followingBlogList_noMore: false,
  personBlogList: [],
  getPersonBlogListResult: createReducerResult(),
  personBlogList_pageIndex: 1,
  //不确定
  personBlogList_pageSize: undefined,
  personBlogList_noMore: false,
  blogDetails: {},
  selectedBlog: {},
  blogCommentLists: {},
  blogCommentList: [],
  blogCommentList_noMore: false,
  getBlogCommentListResult: createReducerResult(),
};

export default handleActions<State>(
  {
    [actionTypes.BLOG_GET_PERSONAL_BLOGLIST]: (state, action) => {
      const {type, payload, meta} = action;
      let {
        request: {pageIndex, pageSize},
      } = meta.parData;
      if (!action.error) {
        pageSize = state.personalBlogList_pageSize;
        if (!pageSize && pageIndex === 1) {
          state.personalBlogList_pageSize = payload.result.length;
          pageSize = state.personalBlogList_pageSize;
        }
        state.personalBlogList = state.personalBlogList
          .slice(0, (pageIndex - 1) * pageSize)
          .concat(payload.result);
        state.personalBlogList_pageIndex = pageIndex;
        state.personalBlogList_noMore =
          (payload.result || []).length === 0 ||
          (payload.result || []).length < pageSize;
      }
      if (pageIndex > 1) {
        action.error = undefined;
      }
      state.getPersonalBlogListResult = actionToResult(
        action,
        null,
        state.personalBlogList,
      );
    },
    [actionTypes.BLOG_CLEAR_PERSONAL_BLOGLIST]: (state, action) => {
      state.personalBlogList = initialState.personalBlogList;
      state.getPersonalBlogListResult = initialState.getPersonalBlogListResult;
      state.personalBlogList_noMore = initialState.personalBlogList_noMore;
      state.personalBlogList_pageIndex =
        initialState.personalBlogList_pageIndex;
      state.personalBlogList_pageSize = initialState.personalBlogList_pageSize;
    },
    [actionTypes.BLOG_GET_PICKED_BLOGLIST]: (state, action) => {
      const {type, payload, meta} = action;
      const {
        request: {pageIndex, pageSize},
      } = meta.parData;
      if (!action.error) {
        state.pickedBlogLis = state.pickedBlogLis
          .slice(0, (pageIndex - 1) * pageSize)
          .concat(payload.result);
        state.pickedBlogLis_pageIndex = pageIndex;
        state.pickedBlogLis_noMore =
          (payload.result || []).length === 0 ||
          (payload.result || []).length < pageSize;
      }
      if (pageIndex > 1) {
        action.error = undefined;
      }
      state.getPickedBlogListResult = actionToResult(
        action,
        null,
        state.pickedBlogLis,
      );
    },
    [actionTypes.BLOG_CLEAR_PICKED_BLOGLIST]: (state, action) => {
      state.pickedBlogLis = initialState.pickedBlogLis;
      state.pickedBlogLis_noMore = initialState.pickedBlogLis_noMore;
      state.getPickedBlogListResult = initialState.getPickedBlogListResult;
      state.pickedBlogLis_pageIndex = initialState.pickedBlogLis_pageIndex;
    },
    [actionTypes.BLOG_GET_HOME_BLOGLIST]: (state, action) => {
      const {type, payload, meta} = action;
      const {
        request: {pageIndex, pageSize},
      } = meta.parData;
      if (!action.error) {
        state.homeBlogList = state.homeBlogList
          .slice(0, (pageIndex - 1) * pageSize)
          .concat(payload.result);
        state.homeBlogList_pageIndex = pageIndex;
        state.homeBlogList_noMore =
          (payload.result || []).length === 0 ||
          (payload.result || []).length < pageSize;
      }
      if (pageIndex > 1) {
        action.error = undefined;
      }
      state.getHomeBlogListResult = actionToResult(
        action,
        null,
        state.homeBlogList,
      );
    },
    [actionTypes.BLOG_CLEAR_HOME_BLOGLIST]: (state, action) => {
      state.homeBlogList = initialState.homeBlogList;
      state.homeBlogList_noMore = initialState.homeBlogList_noMore;
      state.getHomeBlogListResult = initialState.getHomeBlogListResult;
      state.homeBlogList_pageIndex = initialState.homeBlogList_pageIndex;
    },
    [actionTypes.BLOG_GET_FOLLOWING_BLOGLIST]: (state, action) => {
      const {type, payload, meta} = action;
      const {
        request: {pageIndex, pageSize},
      } = meta.parData;
      if (!action.error) {
        state.followingBlogList = state.followingBlogList
          .slice(0, (pageIndex - 1) * pageSize)
          .concat(payload.result);
        state.followingBlogList_pageIndex = pageIndex;
        state.followingBlogList_noMore =
          (payload.result || []).length === 0 ||
          (payload.result || []).length < pageSize;
      }
      if (pageIndex > 1) {
        action.error = undefined;
      }
      state.getFollowingBlogListResult = actionToResult(
        action,
        null,
        state.followingBlogList,
      );
      console.log(state.getFollowingBlogListResult);
    },
    [actionTypes.BLOG_CLEAR_FOLLOWING_BLOGLIST]: (state, action) => {
      state.followingBlogList = initialState.followingBlogList;
      state.followingBlogList_pageIndex =
        initialState.followingBlogList_pageIndex;
      state.followingBlogList_noMore = initialState.followingBlogList_noMore;
      state.getFollowingBlogListResult =
        initialState.getFollowingBlogListResult;
    },
    [actionTypes.PROFILE_GET_PERSON_BLOG_LIST]: (state, action) => {
      const {type, payload, meta} = action;
      let {
        request: {pageIndex, pageSize},
      } = meta.parData;
      if (!action.error) {
        pageSize = state.personBlogList_pageSize;
        if (!pageSize && pageIndex === 1) {
          state.personBlogList_pageSize = payload.result.length;
          pageSize = state.personBlogList_pageSize;
        }
        state.personBlogList = state.personBlogList
          .slice(0, (pageIndex - 1) * pageSize)
          .concat(payload.result);
        state.personBlogList_pageIndex = pageIndex;
        state.personBlogList_noMore =
          (payload.result || []).length === 0 ||
          (payload.result || []).length < pageSize;
      }
      if (pageIndex > 1) {
        action.error = undefined;
      }
      state.getPersonBlogListResult = actionToResult(
        action,
        null,
        state.personBlogList,
      );
    },
    [actionTypes.PROFILE_CLEAR_PERSON_BLOG_LIST]: (state, action) => {
      state.personBlogList = initialState.personBlogList;
      state.getPersonBlogListResult = initialState.getPersonBlogListResult;
      state.personBlogList_pageIndex = initialState.personBlogList_pageIndex;
      state.personBlogList_pageSize = initialState.personBlogList_pageSize;
      state.personBlogList_noMore = initialState.personBlogList_noMore;
    },
    [actionTypes.BLOG_GET_DETAIL]: (
      state,
      action: SagaAction<getBlogDetailRequest>,
    ) => {
      const {payload, meta} = action;
      if (!action.error) {
        state.blogDetails[meta.parData.request.id + ''] = {
          data: payload.result,
        };
      }
      state.blogDetails[meta.parData.request.id + ''] = {
        ...(state.blogDetails[meta.parData.request.id + ''] || {}),
        loadDataResult: actionToResult(action),
      };
    },
    [actionTypes.BLOG_CLEAR_DETAIL]: (
      state,
      action: SagaAction<getBlogDetailRequest>,
    ) => {
      const {payload, meta} = action;
      delete state.blogDetails[meta.parData.request.id + ''];
    },
    [actionTypes.BLOG_SET_SELECTED_BLOG]: (state, action) => {
      state.selectedBlog = action.payload;
    },

    [actionTypes.BLOG_GET_BLOG_COMMENT_LIST]: (
      state,
      action: SagaAction<getBlogCommentListRequest>,
    ) => {
      const {type, payload, meta} = action;
      const {
        request: {pageIndex, pageSize},
      } = meta.parData;
      let key = meta.parData.request.postId + '';
      //防止出现数据重复的现象
      if (!action.error) {
        state.blogCommentLists[key] = {
          list: (state.blogCommentLists[key]
            ? state.blogCommentLists[key].list
            : []
          )
            .slice(0, (pageIndex - 1) * pageSize)
            .concat(payload.result),
          noMore:
            (payload.result || []).length === 0 ||
            (payload.result || []).length < pageSize,
        };
      }
      state.blogCommentLists[key] = {
        ...(state.blogCommentLists[key] || {}),
        loadDataResult: actionToResult(
          action,
          null,
          (state.blogCommentLists[key] || {}).list,
        ),
      };
    },
    [actionTypes.BLOG_CLEAR_BLOG_COMMENT_LIST]: (
      state,
      action: SagaAction<getBlogDetailRequest>,
    ) => {
      let key = action.meta.parData.request.id + '';
      delete state.blogCommentLists[key];
    },
    [actionTypes.BLOG_COMMENT_BLOG]: (state, action) => {
      const {
        meta: {
          parData: {
            request: {blogApp, postId, comment},
          },
        },
      } = action;
      //将回答的评论数量更改
      for (let blog of state.personalBlogList) {
        if (blog.Id === postId) {
          blog.CommentCount = blog.CommentCount + 1;
          state.selectedBlog = blog;
          break;
        }
      }
      for (let blog of state.personBlogList) {
        if (blog.Id === postId) {
          blog.CommentCount = blog.CommentCount + 1;
          state.selectedBlog = blog;
          break;
        }
      }
      for (let blog of state.pickedBlogLis) {
        if (blog.Id === postId) {
          blog.CommentCount = blog.CommentCount + 1;
          state.selectedBlog = blog;
          break;
        }
      }
      for (let blog of state.homeBlogList) {
        if (blog.Id === postId) {
          blog.CommentCount = blog.CommentCount + 1;
          state.selectedBlog = blog;
          break;
        }
      }
    },
    [actionTypes.HOME_REFRESH_DATA_TIME]: (state, action) => {
      for (let blog of state.personalBlogList) {
        blog.postDateDesc = StringUtils.formatDate(blog.PostDate);
      }
      for (let blog of state.personBlogList) {
        blog.postDateDesc = StringUtils.formatDate(blog.PostDate);
      }
      for (let blog of state.pickedBlogLis) {
        blog.postDateDesc = StringUtils.formatDate(blog.PostDate);
      }
      for (let blog of state.homeBlogList) {
        blog.postDateDesc = StringUtils.formatDate(blog.PostDate);
      }
      if (state.selectedBlog.postDateDesc) {
        state.selectedBlog.postDateDesc = StringUtils.formatDate(
          state.selectedBlog.PostDate,
        );
      }
    },
  },
  initialState,
);
