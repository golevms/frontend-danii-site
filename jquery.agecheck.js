/*
 * Plugin: ageCheck.js
 * Description: A simple plugin to verify user's age.
 * Uses sessionStorage API to store if user is verified.
 * Options can be passed for easy customization.
 * Author: Michael Soriano
 * Author's website: http://fearlessflyer.com*
 *
 */

(function ($) {
  $.ageCheck = function (options) {
    const settings = $.extend({
      minAge: 21,
      redirectTo: './home.html',
      redirectOnFail: '',
      title: 'Age Verification',
      copy: 'This Website requires you to be [21] years or older to enter. Please enter your Date of Birth in the fields below in order to continue:',
    }, options);


    const _this = {
      month: '',
      day: '',
      year: '',
      age: '',
      errors: [],
      setValues() {
        const month = $('.ac-container .month').val();
        const day = $('.ac-container .day').val();
        _this.month = month;
        _this.day = day.replace(/^0+/, ''); // remove leading zero
        _this.year = $('.ac-container .year').val();
      },
      validate() {
        _this.errors = [];
        if (/^([0-9]|[12]\d|3[0-1])$/.test(_this.day) === false) {
          _this.errors.push('Day is invalid or empty');
        }

        _this.clearErrors();
        _this.displayErrors();
        return _this.errors.length < 1;
      },
      clearErrors() {
        $('.errors').html('');
      },
      displayErrors() {
        let html = '<ul>';
        for (let i = 0; i < _this.errors.length; i++) {
          html += `<li><span>x</span>${_this.errors[i]}</li>`;
        }
        html += '</ul>';
        setTimeout(() => {
          $('.ac-container .errors').html(html);
        }, 200);
      },
      reCenter(b) {
        b.css('top', `${Math.max(0, (($(window).height() - (b.outerHeight() + 150)) / 2))}px`);
        b.css('left', `${Math.max(0, (($(window).width() - b.outerWidth()) / 2))}px`);
      },
      buildHtml() {
        const copy = settings.copy;
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const days = ['1', '2', '3', '4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31'];
        const years = ['1995','1994','1993','1992','1991','1990','1989','1988','1987','1986','1985','1984','1983','1982','1981','1980','1979','1978','1977','1976','1975','1974','1973','1972','1971','1970','1969','1970','1969','1968','1967','1966','1965','1964','1963','1962','1961','1960','1959','1958','1957','1956','1955','1954','1953','1952','1951','1950','1949','1948','1947','1946','1945','1944','1943','1942','1941','1940','1939','1938','1937','1936','1935','1934','1933','1932','1931','1930','1929','1928','1927','1926','1925','1924','1923','1922','1921','1920','1919','1918','1917','1916','1915','1914'];
        let html = '';
        html += '<div class="ac-overlay"></div>';
        html += '<div class="ac-container">';
        html += `<h2>${settings.title}</h2>`;
        html += `<p>${copy.replace('[21]', `<strong>${settings.minAge}</strong>`)}`; +'</p>';
        html += '<div class="errors"></div>';
        html += '<div class="fields"><select class="month">';
        for (let i = 0; i < months.length; i++) {
          html += `<option value="${i}">${months[i]}</option>`;
        }
        html += '</select>';
        html += '<select class="day">';
         for (let i = 0; i < days.length; i++) {
          html += `<option value="${i}">${days[i]}</option>`;
        }
        html += '</select>';
        html += '<select class="year">';
         for (let i = 0; i < years.length; i++) {
          html += `<option value="${i}">${years[i]}</option>`;
        }
        html += '</select>';
        html += '<button>Submit</button></div></div>';

        $('body').append(html);

        $('.ac-overlay').animate({
          opacity: 0.8,
        }, 500, () => {
          _this.reCenter($('.ac-container'));
          $('.ac-container').css({
            opacity: 1,
          });
        });

        $('.ac-container .day, .ac-container .year').focus(function () {
          $(this).removeAttr('placeholder');
        });
      },
      setAge() {
        _this.age = '';
        const birthday = new Date(_this.year, _this.month, _this.day);
        const ageDifMs = Date.now() - birthday.getTime();
        const ageDate = new Date(ageDifMs); // miliseconds from epoch
        _this.age = Math.abs(ageDate.getUTCFullYear() - 1970);
      },
      setSessionStorage(key, val) {
        try {
          sessionStorage.setItem(key, val);
          return true;
        } catch (e) {
          return false;
        }
      },
      handleSuccess() {
        const successMsg = '<h3>Success!</h3><p>You are now being redirected back to the application...</p>';
        $('.ac-container').html(successMsg);
        setTimeout(() => {
          $('.ac-container').animate({
            top: '-350px',
          }, 200, () => {
            $('.ac-overlay').animate({
              opacity: '0',
            }, 500, () => {
              if (settings.redirectTo !== '') {
                window.location.replace(settings.redirectTo);
              } else {
                $('.ac-overlay, .ac-container').remove();
              }
            });
          });
        }, 2000);
      },
      handleUnderAge() {
        const underAgeMsg = '<h3>Sorry, you are not old enough to view this site...</h3>';
        $('.ac-container').html(underAgeMsg);
        if (settings.redirectOnFail !== '') {
          setTimeout(() => {
            window.location.replace(settings.redirectOnFail);
          }, 2000);
        }
      },
    }; // end _this

    if (sessionStorage.getItem('ageVerified') === 'true') {
      return false;
    }

    _this.buildHtml();

    $('.ac-container button').on('click', () => {
      _this.setValues();
      if (_this.validate() === true) {
        _this.setAge();

        if (_this.age >= settings.minAge) {
          if (!_this.setSessionStorage('ageVerified', 'true')) {
            console.log('sessionStorage not supported by your browser');
          }
          _this.handleSuccess();
        } else {
          _this.handleUnderAge();
        }
      }
    });

    $(window).resize(() => {
      _this.reCenter($('.ac-container'));
      setTimeout(() => {
        _this.reCenter($('.ac-container'));
      }, 500);
    });
  };
}(jQuery));
