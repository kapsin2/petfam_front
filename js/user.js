function getUserNickname() {
  sendAuthorizedRequest("http://localhost:8080/users/profiles", "GET", function (response) {
    console.log(response);
    console.log(response.nickname);
    $('#main-item-welcome').empty();
    $('#main-item-welcome').append(response.nickname+'님 반갑습니다.');

    if (window.location.href === "blog-single.html") {
      const temp_html = `<h3>${response.nickname}</h3>`;

      $('#CommentNickname').append(temp_html);
    }
  });
}

function getIsAdmin() {
  return new Promise((resolve, reject) => {
    sendAuthorizedRequest("http://localhost:8080/users/profiles", "GET", function (response) {
      if (response.role === "ROLE_ADMIN") {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}


function getUserMe() {
  sendAuthorizedRequest("http://localhost:8080/users/profiles", "GET", function (response) {
    console.log(response);
    $('#my-profile-nickname').empty();
    $('#my-profile-nickname').append(response.nickname);
    $('#my-profile-introduction').empty();
    $('#my-profile-introduction').append(response.introduction);
    document.getElementById("img-thumbnail-src").src = response.image;
  });

}

function getUser() {
  const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
  sendAuthorizedRequest("http://localhost:8080/users/profiles/"+id, "GET", function (response) {
    console.log(response);
    console.log(response.nickname);
    $('#card-content1-user').empty();
    $('#card-content1-user').append(response.nickname);
    $('#card-content2-user').empty();
    $('#card-content2-user').append(response.introduction);
    document.getElementById("img-thumbnail-src").src = response.image;
  });

}


function logout() {
  const auth = getToken();
  const auth_r = getRefreshToken();
  var settings = {
    "url": "http://localhost:8080/users/signout",
    "method": "POST",
    "timeout": 0,
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", auth);
      xhr.setRequestHeader("Refresh_authorization", auth_r);
    }
  };
  
  $.ajax(settings).done(function (response,status,xhr) {
    console.log(response);
    if (response == 'success'){
      alert('로그아웃')
      window.location.href = 'http://127.0.0.1:5501/index.html';
      document.cookie =
              'Authorization' + '=' + "" + ';path=/'; 
        document.cookie = 
              'Refresh_authorization' + '=' + "" + ';path=/';
    } else {
      alert('로그아웃 실패')
    }
  });
};


function profileUpdate() {
  const fileInput = document.getElementById("formGroupExampleInput3");
  if(fileInput && fileInput.files && fileInput.files[0]) {
  localStorage.removeItem("imageUrl");
  uploadImage().then(() => {
    const auth = getToken();
    let nickname = $('#formGroupExampleInput').val();
    let introduction = $('#formGroupExampleInput2').val();
    let image = localStorage.getItem("imageUrl");

    console.log(image);
    var settings = {
      "url": "http://localhost:8080/users/profiles",
      "method": "PATCH",
      "timeout": 0,
      "headers": {
        "Content-Type": "application/json"
      },
      "data": JSON.stringify({
        "nickname": nickname,
        "introduction": introduction,
        "image" : image
      }),
      "beforeSend": function(xhr) {
        xhr.setRequestHeader("Authorization", auth);
      }
    };

    $.ajax(settings).done(function (response) {
      console.log(response);
      if (response == "success"){
        alert("프로필 수정 완료")
        window.location.href = 'http://127.0.0.1:5501/MyProfile.html';
      }
    });
  })} else{
    const auth = getToken();
    let nickname = $('#formGroupExampleInput').val();
    let introduction = $('#formGroupExampleInput2').val();
    let image = "";

    console.log(image);
    var settings = {
      "url": "http://localhost:8080/users/profiles",
      "method": "PATCH",
      "timeout": 0,
      "headers": {
        "Content-Type": "application/json"
      },
      "data": JSON.stringify({
        "nickname": nickname,
        "introduction": introduction,
        "image" : image
      }),
      "beforeSend": function(xhr) {
        xhr.setRequestHeader("Authorization", auth);
      }
    };

    $.ajax(settings).done(function (response) {
      console.log(response);
      if (response == "success"){
        alert("프로필 수정 완료")
        window.location.href = 'http://127.0.0.1:5501/MyProfile.html';
      }
    });
  }
  
}

function uploadImage() {
  return new Promise((resolve, reject) => {
    const auth = getToken();

    const fileInput = document.getElementById("formGroupExampleInput3");
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("file", file);

    var settings = {
      "url": "http://localhost:8080/upload",
      "method": "POST",
      "timeout": 0,
      "headers": {},
      "processData": false,
      "mimeType": "multipart/form-data",
      "contentType": false,
      "data": formData,
      "beforeSend": function(xhr) {
        xhr.setRequestHeader("Authorization", auth);
      }
    };

    $.ajax(settings).done(function (response) {
      console.log(response);
      localStorage.setItem("imageUrl", response); // 저장소에 이미지 URL 저장
      resolve(); // 이미지 업로드 완료를 알림
    }).fail(function (jqXHR, textStatus, errorThrown) {
      reject(errorThrown); // 에러가 발생한 경우 Promise를 reject()로 반환
    });
  });
}


function getAllUsers() {
  sendAuthorizedRequest("http://localhost:8080/admin/users", "GET", function (response) {
    console.log(response);
    let rows = response['content']
    for (let i = 0; i < rows.length; i++) {
        let id = rows[i]['id']
        let username = rows[i]['username']
        let nickname = rows[i]['nickname']
        let role = rows[i]['role']
        
        let temp_html =`
        <tr>
        <th class="table1">${id}</th>
        <th class="table2" data-post-id="${id}"><a class="table222" href="GetProfile.html?id=${id}">${username}</a></th>
        <th class="table3">${nickname}</th>
        <th class="table4">${role}</th>
        </tr>`

        // post-table에 temp_html 추가
      $('#post-table-users').append(temp_html);
    }
  });
}

function  getToken() {
  let cName = 'Authorization' + '=';
  let cookieData = document.cookie;
  let cookie = cookieData.indexOf('Authorization');
  let auth = '';
  if(cookie !== -1){
      cookie += cName.length;
      let end = cookieData.indexOf(';', cookie);
      if(end === -1)end = cookieData.length;
      auth = cookieData.substring(cookie, end);
  }

  return auth;
}

function  getRefreshToken() {
  let cName = 'Refresh_authorization' + '=';
  let cookieData = document.cookie;
  let cookie = cookieData.indexOf('Refresh_authorization');
  let auth = '';
  if(cookie !== -1){
      cookie += cName.length;
      let end = cookieData.indexOf(';', cookie);
      if(end === -1)end = cookieData.length;
      auth = cookieData.substring(cookie, end);
  }

  return auth;
}

function sendAuthorizedRequest(url, method, callback) {
  const auth = getToken();
  var settings = {
    "url": url,
    "method": method,
    "timeout": 0,
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", auth);
    }
  };
  $.ajax(settings)
    .done(callback)
    .fail(function (jqXHR, textStatus, errorThrown) {
      if (jqXHR.status === 403) {
        const refresh = getRefreshToken();
        var refreshSettings = {
          "url": "http://localhost:8080/users/refresh",
          "method": "POST",
          "timeout": 0,
          "beforeSend": function(xhr) {
            xhr.setRequestHeader("Refresh_authorization", refresh);
          }
        };
        $.ajax(refreshSettings)
          .done(function (response, status, xhr) {
            document.cookie = 'Authorization' + '=' + xhr.getResponseHeader('Authorization') + ';path=/'; 
            const newAccessToken = getToken();
            settings.headers.Authorization = newAccessToken;
            $.ajax(settings).done(callback);
          });
      } else {
        console.log(errorThrown);
      }
    });
}

function ck_id() {
  const id = $('#username').val();

$.ajax({
  url: 'http://localhost:8080/users/id',
  method: 'POST',
  contentType: 'application/json',
  data: JSON.stringify({
    "username": id,
    }),
  success: function(response) {
    console.log(response);
    if(response == "success") {
      alert('사용할수 있는 아이디입니다.')
    } else {
      alert('다른 아이디를 입력해주세요')
    }
  }
});

}

function ck_nickname() {
  const nickname = $('#nickname').val();

  $.ajax({
    url: 'http://localhost:8080/users/nickname',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      "nickname": nickname
      }),
    success: function(response) {
      console.log(response);
      if(response == "success") {
        alert('사용할수 있는 닉네임입니다.')
      } else {
        alert('다른 닉네임를 입력해주세요')
      }
    }
  });
}

