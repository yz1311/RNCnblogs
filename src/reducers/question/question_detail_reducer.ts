import * as actionTypes from '../../actions/actionTypes';
import {
  handleActions,
  createReducerResult,
  actionToResult,
} from '../../utils/reduxUtils';

export interface State {
  questionDetail: any;
  getQuestionDetailResult: any;
  selectedQuestion: any;
  commentList: Array<any>;
  getCommentListResult: any;
  answerList: Array<any>;
  getAnswerListResult: any;
  selectedAnswer: any;
  answerCommentList: Array<any>;
  getAnswerCommentListResult: any;
}

const initialState: State = {
  questionDetail: {},
  getQuestionDetailResult: createReducerResult(),
  selectedQuestion: {},
  commentList: [],
  getCommentListResult: createReducerResult(),
  answerList: [],
  getAnswerListResult: createReducerResult(),
  selectedAnswer: {},
  answerCommentList: [],
  getAnswerCommentListResult: createReducerResult(),
};

export default handleActions(
  {
    [actionTypes.QUESTION_GET_DETAIL]: (state: State, action) => {
      const {payload} = action;
      if (!action.error) {
        state.questionDetail = payload.result;
        //从收藏里面进入详情，数据是缺失的，需要这里补全
        state.selectedQuestion = payload.result;
      }
      state.getQuestionDetailResult = actionToResult(action);
    },
    [actionTypes.QUESTION_CLEAR_DETAIL]: (state: State, action) => {
      state.questionDetail = initialState.questionDetail;
      state.getQuestionDetailResult = initialState.getQuestionDetailResult;
      state.selectedQuestion = initialState.selectedQuestion;
    },
    [actionTypes.QUESTION_DELETE_ANSWER]: (state: State, action) => {
      const {
        meta: {
          parData: {
            request: {questionId, answerId},
          },
        },
      } = action;
      if (!action.error) {
        state.selectedQuestion.AnswerCount =
          state.selectedQuestion.AnswerCount + 1;
        //将问题的回答数量更改
        for (let answer of state.answerList) {
          if (answer.Qid === questionId) {
            answer.AnswerCount = answer.AnswerCount + 1;
            state.selectedQuestion = answer;
            break;
          }
        }
      }
    },
    [actionTypes.QUESTION_SET_SELECTED_QUESTION]: (state: State, action) => {
      const {payload} = action;
      state.selectedQuestion = payload;
    },
    [actionTypes.QUESTION_GET_COMMENT_LIST]: (state: State, action) => {
      const {payload} = action;
      if (!action.error) {
        state.commentList = payload.result;
      }
      state.getCommentListResult = actionToResult(action);
    },
    [actionTypes.QUESTION_CLEAR_COMMENT_LIST]: (state: State, action) => {
      state.commentList = initialState.commentList;
      state.getCommentListResult = initialState.getCommentListResult;
    },
    [actionTypes.QUESTION_GET_ANSWER_LIST]: (state: State, action) => {
      const {payload} = action;
      if (!action.error) {
        state.answerList = payload.result;
      }
      state.getAnswerListResult = actionToResult(action);
    },
    [actionTypes.QUESTION_CLEAR_ANSWER_LIST]: (state: State, action) => {
      state.answerList = initialState.answerList;
      state.getAnswerListResult = initialState.getAnswerListResult;
    },
    [actionTypes.QUESTION_SET_SELECTED_ANSWER]: (state: State, action) => {
      const {payload} = action;
      state.selectedAnswer = payload;
    },
    [actionTypes.QUESTION_GET_ANSWER_COMMENT_LIST]: (state: State, action) => {
      const {payload} = action;
      if (!action.error) {
        state.answerCommentList = payload.result;
      }
      state.getAnswerCommentListResult = actionToResult(action);
    },
    [actionTypes.QUESTION_CLEAR_ANSWER_COMMENT_LIST]: (
      state: State,
      action,
    ) => {
      state.answerCommentList = initialState.answerCommentList;
      state.getAnswerCommentListResult =
        initialState.getAnswerCommentListResult;
    },
    [actionTypes.QUESTION_COMMENT_ANSWER]: (state: State, action) => {
      const {
        meta: {
          parData: {
            request: {questionId, answerId, commentId},
          },
        },
      } = action;
      //将回答的评论数量更改
      for (let answer of state.answerList) {
        if (answer.AnswerID === answerId) {
          answer.CommentCounts = answer.CommentCounts + 1;
          state.selectedAnswer = answer;
          break;
        }
      }
    },
    [actionTypes.QUESTION_DELETE_COMMENT_ANSWER]: (state: State, action) => {
      const {
        meta: {
          parData: {
            request: {questionId, answerId, commentId},
          },
        },
      } = action;
      //将回答的评论数量更改
      for (let answer of state.answerList) {
        if (answer.AnswerID === answerId) {
          answer.CommentCounts = answer.CommentCounts - 1;
          state.selectedAnswer = answer;
          break;
        }
      }
    },
    [actionTypes.QUESTION_MODIFY_QUESTION]: (state: State, action) => {
      const {
        meta: {
          parData: {
            request: {questionId, Title, Content, Flags, UserID},
          },
        },
      } = action;
      if (state.selectedQuestion.Qid === questionId) {
        state.selectedQuestion.Title = Title;
        state.selectedQuestion.Content = Content;
        state.selectedQuestion.Flags = Flags;
        state.selectedQuestion.UserID = UserID;
      }
      if (state.questionDetail.Qid === questionId) {
        state.questionDetail.Title = Title;
        state.questionDetail.Content = Content;
        state.questionDetail.Flags = Flags;
        state.questionDetail.UserID = UserID;
      }
    },
  },
  initialState,
);
