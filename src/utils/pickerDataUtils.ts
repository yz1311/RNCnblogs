import moment from 'moment';

export default class pickerDataUtils {
  static creatDateData(minDate, maxData, labelUnit) {
    if (!(minDate instanceof moment)) {
      minDate = moment(minDate);
    }
    if (!(maxData instanceof moment)) {
      maxData = moment(maxData);
    }
    if (!labelUnit) {
      labelUnit = {
        year: '年',
        month: '月',
        date: '日',
      };
    }
    const YEARUNIT = labelUnit.year;
    const MONTHUNIT = labelUnit.month;
    const DAYUNIT = labelUnit.date;

    const beginYear = minDate.year();
    const beginMonth = minDate.month() + 1;
    const beginDate = minDate.date();

    const nowYear = maxData.year();
    const nowMonth = maxData.month() + 1;
    const nowDate = maxData.date();

    let date = [];
    for (let i = beginYear; i <= nowYear; i++) {
      let month = [];

      let startJ = 1,
        endJ = 13;
      if (i == beginYear) {
        startJ = beginMonth;
      }
      if (i == nowYear) {
        endJ = nowMonth + 1;
      }

      for (let j = startJ; j < endJ; j++) {
        let startDateFlag = i == beginYear && j == beginMonth;
        let endDateFlag = i == nowYear && j == nowMonth;

        let day = [];
        if (j === 2) {
          for (
            let k = startDateFlag ? beginDate : 1;
            k < (endDateFlag ? nowDate + 1 : 29);
            k++
          ) {
            day.push(k + DAYUNIT);
          }
          //Leap day for years that are divisible by 4, such as 2000, 2004
          if (i % 4 === 0) {
            day.push((endDateFlag ? nowDate + 1 : 29) + '日');
          }
        } else if (j in {1: 1, 3: 1, 5: 1, 7: 1, 8: 1, 10: 1, 12: 1}) {
          for (
            let k = startDateFlag ? beginDate : 1;
            k < (endDateFlag ? nowDate + 1 : 32);
            k++
          ) {
            day.push(k + DAYUNIT);
          }
        } else {
          for (
            let k = startDateFlag ? beginDate : 1;
            k < (endDateFlag ? nowDate + 1 : 31);
            k++
          ) {
            day.push(k + DAYUNIT);
          }
        }
        let _month = {};
        _month[j + MONTHUNIT] = day;
        month.push(_month);
      }
      let _date = {};
      _date[i + YEARUNIT] = month;
      date.push(_date);
    }
    return date;
  }
}
