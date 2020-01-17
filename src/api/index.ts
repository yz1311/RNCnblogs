import * as login from './login';
import * as blog from './blog';
import * as news from './news';
import * as status from './status';
import * as bookmark from './bookmark';
import * as question from './question';
import * as knowledge from './knowledge';
import * as home from './home';
import * as profile from './profile';
import * as message from './message';

export const Api =  {
  login,
  blog,
  news,
  status,
  bookmark,
  question,
  knowledge,
  home,
  profile,
  message
};

//兼容以前的写法
export default {
  login,
  blog,
  news,
  status,
  bookmark,
  question,
  knowledge,
  home,
  profile,
  message
}
