// 페이지 접속시 함수 호출하는 코드
$(document).ready(function () {
    cookie_save();
    petboast_detail();
})

// 쿠키에 있는 토큰 헤더로 실어보내기
const token = getToken('token'); // bearer 토큰 값 가져오기
const headers = {
  'Authorization': `Bearer ${token}`,
};
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

fetch('/blog-single.html?id=' + id, { headers })
  .then(response => {
    // 응답 처리
  })
  .catch(error => {
    // 에러 처리
  });

function getToken() {
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

// 조회수 관련 토큰
function cookie_save(){
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');
  var cookieName = "alreadyViewCookie" + postId;
  var cookies = document.cookie.split("; ");
  var cookieValue = null;
  for (var i = 0; i < cookies.length; i++) {
    if (cookies[i].indexOf(cookieName) === 0) {
      cookieValue = cookies[i].substring(cookieName.length + 1);
      console.log(cookieValue)
      break;
    }
  }
  if (cookieValue === null) {
    // 서버로 AJAX 요청을 보내서 쿠키를 생성합니다.
    $.ajax({
      url: '//localhost:8080/posts/views/' + postId,
      type: "POST",
      xhrFields: {
        withCredentials: true
      },
      success: function(data) {
        // 쿠키 생성에 성공했다면, 쿠키를 설정합니다.
        console.log(data)
        var cookieDate = new Date();
        cookieDate.setTime(cookieDate.getTime() + 24 * 60 * 60 * 1000); // 쿠키 유효시간은 하루입니다.
        document.cookie = cookieName + "=" + postId + ";expires=" + cookieDate.toGMTString() + ";path=/";
      }
    });
  }
};

// 데이터 불러오기
function petboast_detail() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    $.ajax({
      url: 'http://localhost:8080/posts/' + id,
      type: 'GET',
      data: {},
      contentType: "application/json;",
      success: function (response) {
        // 본문
        console.log(response)
        const writer = response['writer']
        const writerId = response['writerId']
        const title = response['title']
        const content = response['content']
        const image = response['image']
        const likes = response['likes']
        const comments = response['comments']

        let temp_html = `
            <p><img src="${image}" alt="missing image" class="img-fluid"></p>
            <h2 class="mb-3">${title} </h2><a href="GetProfile.html?id=${writerId}">${writer}</a>
            <p>${content}</p>
          </div>`
        let temp_html2 = `
              <div>
                <a href="#" onclick="updatePost('${title}','${content}','${image}','${id}')" class="tag-cloud-link" style="font-size: 13px; color:black; cursor: pointer;">수정하기</a>
                <a onclick="deletePost()" class="tag-cloud-link" style="font-size: 13px; color:black; cursor: pointer;">삭제하기</a>
              </div>
              <a onclick="likePost(${id})" style="cursor: pointer; margin-left: 5px;"><button style="background: none; border: none; padding: 0; cursor: pointer; font-size: 1em; color: red;">&#x2764;</button></a>
              <a class="tag-cloud-link" style="font-size: 1em; margin-left: 5px; color: black;">${likes}
              <span style="color: red;">&#x2764;</span></a>
              
            `
        $('#post-detail').append(temp_html);
        $('#post-detail2').append(temp_html2);

            // 댓글
            for(let i=0; i< response.comments.length; i++){
                const comment = response.comments[i];
                const commentId = comment.id;
                const commentWriter = comment.writer;
                const commentContent = comment.content;
                const commentLikes = comment.likes;
                const commentCreatedAt = comment.createdAt;
                const reComments = comment.reComments;
                let commentLength = response.comments.length;
                let reCommentLength = reComments.length;

                // 댓글 개수 출력
                // const totalLength = commentLength - reCommentLength;
                // const temp_html_commentLength = `${totalLength}`;
                // $('#post-commentLength').append(temp_html_commentLength);

                const year = commentCreatedAt[0];
                const month = commentCreatedAt[1] - 1;
                const day = commentCreatedAt[2];
                const hour = commentCreatedAt[3];
                const minute = commentCreatedAt[4];
                const meridiem = hour >= 12 ? 'PM' : 'AM';
                const formattedHour = hour % 12 || 12;
                const formattedMinute = minute < 10 ? `0${minute}` : minute;
                const formattedDate = new Date(year, month, day).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
                const formattedTime = `${formattedHour}:${formattedMinute}${meridiem}`;

                const formattedCreatedAt = `${formattedDate} at ${formattedTime}`;

                let temp_html_commentList = `<li class="comment">
                <div class="vcard bio">
                </div>
                <div class="comment-body">
                  <h3>${commentWriter}</h3>
                  <div class="meta" style="float:left; clear:left;">${formattedCreatedAt}</div>
                  <div class="tagcloud" style="float:right;">
                    <a onclick="comment_open(${commentId}, '${commentContent}')" style="cursor: pointer; color:black;" class="tag-cloud-link">수정하기</a>
                    <a onclick="deleteComment(${commentId})" class="tag-cloud-link" style="cursor: pointer; color:black;">삭제하기</a>
                    <a ><button onclick="likeComment(${commentId})" style="background: none; border: none; padding: 0; font-size: inherit; cursor: pointer; color: red;">&#x2764;</button></a>
                    </div>
                    <div style="clear:both;"></div>
                  <p>${commentContent}</p>
                  <p><a onclick="recomment_open(${commentId})" class="reply">Reply</a>
                  <a class="tag-cloud-link" style="font-size: 1em; margin-left: 10px; color: black;">${commentLikes}
                  <span style="color: red;">&#x2764;</span></a></p>

                  <div class="input-and-button mb-3 commentbox-${commentId}" style="display:none;">
                      <input type="text" class="form-control" id="formGroupExampleInput4" 
                      style = "margin-bottom : 10px;" placeholder="수정할 댓글을 작성해주세요.">
                    <div class="tagcloud" style=" float:right;">
                    <p><a onclick="updateComment(${commentId})" style="cursor:pointer" class="tag-cloud-link">수정하기</a>
                    <button onclick="comment_close(${commentId})" type="button" class="btn-close" aria-label="Close" style="width: 10px; height: 10px;"></button></p>
                    </div></div>

                  <div class="input-and-button mb-3 recommentbox-${commentId}" style="display:none;">
                      <input type="text" class="form-control" id="formGroupExampleInput3" 
                      style = "margin-bottom : 10px;" placeholder="댓글을 등록하세요.">
                    <div class="tagcloud" style=" float:right;">
                    <p><a onclick="createReComment(${commentId})" style="cursor:pointer" class="tag-cloud-link">댓글달기</a>
                    <button onclick="recomment_close(${commentId})" type="button" class="btn-close" aria-label="Close" style="width: 10px; height: 10px;"></button></p>
                    </div></div></div>`
                $('#comment-list').append(temp_html_commentList);
                    

                // 대댓글
                for(let j=0; j< reComments.length; j++){
                    const reComment = reComments[j];
                    const recommentId = reComment.id;
                    const reCommentWriter = reComment.writer;
                    const reCommentContent = reComment.content;
                    const reCommentLikes = reComment.likes;
                    const reCommentLength = reComments.length;
                    const reCommentCreatedAt = reComment.createdAt;

                    const reyear = reCommentCreatedAt[0];
                    const remonth = reCommentCreatedAt[1] - 1;
                    const reday = reCommentCreatedAt[2];
                    const rehour = reCommentCreatedAt[3];
                    const reminute = reCommentCreatedAt[4];
                    const remeridiem = rehour >= 12 ? 'PM' : 'AM';
                    const reformattedHour = rehour % 12 || 12;
                    const reformattedMinute = reminute < 10 ? `0${reminute}` : reminute;
                    const reformattedDate = new Date(reyear, remonth, reday).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
                    const reformattedTime = `${reformattedHour}:${reformattedMinute}${remeridiem}`;

                    const reformattedCreatedAt = `${reformattedDate} at ${reformattedTime}`;

                    let temp_html_recommentList = `
                    <ul class="children">
                    <li class="comment">
                      <div class="vcard bio">
                      </div>
                      <div class="comment-body" id="comment-childrenList">
                      <h3>${reCommentWriter}</h3>
                      <div class="meta">${reformattedCreatedAt}</div>
                      <div class="tagcloud" style="float:right;">
                        <a onclick="recomment_update_open(${recommentId}, '${reCommentContent}')" style="cursor: pointer; color:black;" class="tag-cloud-link">수정하기</a>
                        <a onclick="deleteReComment(${recommentId})" style="cursor: pointer; color:black;" class="tag-cloud-link">삭제하기</a>
                        <a onclick="likeReComment(${recommentId})"><button style="background: none; border: none; padding: 0; font-size: inherit; cursor: pointer; color: red;">&#x2764;</button></a>
                      </div>
                      <p>${reCommentContent}</p>
                      <a class="tag-cloud-link" style="font-size: 1em; margin-left: 10px; color: black;">${reCommentLikes}
                      <span style="color: red;">&#x2764;</span></a></p>

                      <div class="input-and-button mb-3 recommentUpdateBox-${recommentId}" style="display:none;">
                        <input type="text" class="form-control" id="formGroupExampleInput5" 
                        style = "margin-bottom : 10px;" placeholder="수정할 댓글을 작성해주세요.">
                        <div class="tagcloud" style=" float:right;">
                        <p><a onclick="updateReComment(${recommentId})" style="cursor:pointer" class="tag-cloud-link">수정하기</a>
                        <button onclick="recomment_update_close(${recommentId})" type="button" class="btn-close" aria-label="Close" style="width: 10px; height: 10px;"></button></p>
                        </div>
                      </div>
                    </div></div>
                      </li>
                    </ul>
                  </li>
                    `
                    $('#comment-list').append(temp_html_recommentList);
                }
              
              }
            
          
        }
    });
}

// 게시글 수정
function updatePost(title, content, image, id) {
  // 현재 페이지에서 가져온 데이터를 localStorage에 저장
  localStorage.setItem('title', title);
  localStorage.setItem('content', content);
  localStorage.setItem('image', image);
  localStorage.setItem('id', id);
  // 수정 페이지로 이동
  window.location.href = "updatePost.html";
  }


// 게시글 삭제
function deletePost(){
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  const auth = getToken();
  alert("게시글을 삭제합니다.")
  $.ajax({
    url: 'http://localhost:8080/posts/' + id,
    type: 'DELETE',
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", auth);
    },
    success: function(result) {
      console.log('DELETE request succeeded.');
      // 페이지 이동
      location.href = '/blog.html';
    },
    error: function(xhr, status, error) {
      console.error('DELETE request failed.');
      // handle error
    }
  });
}

// 댓글 등록
function comment_register() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  const auth = getToken();
  var content = $('#formGroupExampleInput22').val();
  // AJAX 요청 보내기
  $.ajax({
    url: 'http://localhost:8080/posts/'+id+'/comments',
    type: 'POST',
    data: JSON.stringify({content: content}),
    headers: {
      'Content-Type': 'application/json' // 서버에서 지원하는 타입으로 변경
    },
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", auth);
    },
    success: function(data) {
      // 서버로부터 성공적인 응답을 받았을 때 실행할 코드
      console.log('글이 성공적으로 작성되었습니다!');
      // 페이지 이동
      location.href = "blog-single.html?id="+id;
    },
    error: function(jqXHR, textStatus, errorThrown) {
      // 서버로부터 오류 응답을 받았을 때 실행할 코드
      console.log('글 작성에 실패했습니다: ' + textStatus + ' - ' + errorThrown);
    }
  })};

  // 댓글 수정
function updateComment(commentId){
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  var content = $('#formGroupExampleInput4').val();
  
    const auth = getToken();
    $.ajax({
      url: 'http://localhost:8080/comments/' + commentId,
      type: 'PATCH',
      data: JSON.stringify({content: content}),
      headers: {
        'Content-Type': 'application/json'
      },
      "beforeSend": function(xhr) {
        xhr.setRequestHeader("Authorization", auth);
      },
      success: function(data) {
        console.log('글이 성공적으로 수정되었습니다!');
        // 페이지 이동
        location.href = "blog-single.html?id="+id;
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log('글 작성에 실패했습니다: ' + textStatus + ' - ' + errorThrown);
      }
    });
  };
        
// 댓글 삭제
function deleteComment(commentId){
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  
  const auth = getToken();
  alert("댓글을 삭제합니다.")
  $.ajax({
    url: 'http://localhost:8080/comments/' + commentId,
    type: 'DELETE',
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", auth);
    },
    success: function(result) {
      console.log('DELETE request succeeded.');
      // 페이지 이동
      location.href = "blog-single.html?id="+id;
    },
    error: function(xhr, status, error) {
      console.error('DELETE request failed.');
      // handle error
    }
  });
}

// 댓글에 대댓글 등록
function createReComment(commentId){
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const auth = getToken();
  
  var content = $('#formGroupExampleInput3').val();
  $.ajax({
  url: 'http://localhost:8080/comments/'+commentId+'/recomments',
  type: 'POST',
  data: JSON.stringify({content: content}),
  headers: {'Content-Type': 'application/json'},
  "beforeSend": function(xhr) {xhr.setRequestHeader("Authorization", auth);},
  success: function(data) {
    console.log('대댓글이 성공적으로 등록되었습니다!');
    // 페이지 이동
    location.href = "blog-single.html?id="+id;
  },
  error: function(jqXHR, textStatus, errorThrown) {
    console.log('대댓글 등록에 실패했습니다: ' + textStatus + ' - ' + errorThrown);
  }
  });
}

// 대댓글 수정
function updateReComment(recommentId){
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  var content = $('#formGroupExampleInput5').val();

  const auth = getToken();
$.ajax({
  url: 'http://localhost:8080/recomments/' + recommentId,
  type: 'PATCH',
  data: JSON.stringify({content: content}),
  headers: {
    'Content-Type': 'application/json'
  },
  "beforeSend": function(xhr) {
    xhr.setRequestHeader("Authorization", auth);
  },
  success: function(data) {
    console.log('글이 성공적으로 수정되었습니다!');
    // 페이지 이동
    location.href = "blog-single.html?id="+id;
  },
  error: function(jqXHR, textStatus, errorThrown) {
    // 서버로부터 오류 응답을 받았을 때 실행할 코드
    console.log('글 작성에 실패했습니다: ' + textStatus + ' - ' + errorThrown);
  }
});
};

// 대댓글 삭제
function deleteReComment(recommentId){
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  
  const auth = getToken();
  alert("댓글을 삭제합니다.")
  $.ajax({
    url: 'http://localhost:8080/recomments/' + recommentId,
    type: 'DELETE',
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", auth);
    },
    success: function(result) {
      console.log('DELETE request succeeded.');
      // 페이지 이동
      location.href = "blog-single.html?id="+id;
    },
    error: function(xhr, status, error) {
      console.error('DELETE request failed.');
    }
  });
}

// 게시글 좋아요
function likePost(id){
  const auth = getToken();
  $.ajax({
    url: 'http://localhost:8080/posts/' + id + '/like',
    type: 'POST',
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", auth);
    },
    success: function(result) {
      console.log('success');
      // 페이지 이동
      location.href = "blog-single.html?id="+id;
    },
    error: function(xhr, status, error) {
      console.error('Like request failed.');
      // handle error
    }
  });
  }
  
  // 댓글 좋아요
  function likeComment(commentId){
  const auth = getToken();
  $.ajax({
    url: 'http://localhost:8080/comments/' + commentId + '/like',
    type: 'POST',
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", auth);
    },
    success: function(result) {
      console.log('success');
      // 페이지 이동
      location.href = "blog-single.html?id="+id;
    },
    error: function(xhr, status, error) {
      console.error('Like request failed.');
      // handle error
    }
  });
  }
  
  // 대댓글 좋아요
  function likeReComment(recommentId){
  const auth = getToken();
  $.ajax({
    url: 'http://localhost:8080/recomments/' + recommentId + '/like',
    type: 'POST',
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", auth);
    },
    success: function(result) {
      console.log('success');
      // handle success
      // 페이지 이동
      location.href = "blog-single.html?id="+id;
    },
    error: function(xhr, status, error) {
      console.error('Like request failed.');
      // handle error
    }
  });
  }


// 댓글 수정창 보이기
function comment_open(commentId, commentContent) {
  document.querySelector('.commentbox-'+commentId).style.display = 'block';
  document.querySelector('#formGroupExampleInput4').value = commentContent;
}
  
// 댓글 수정창 닫기
function comment_close(commentId) {
  document.querySelector('.commentbox-'+commentId).style.display = 'none';
}

// 댓글에 대댓글 등록창 보이기
function recomment_open(commentId) {
  document.querySelector('.recommentbox-'+commentId).style.display = 'block';
}

// 댓글에 대댓글 등록창 닫기
function recomment_close(commentId) {
  document.querySelector('.recommentbox-'+commentId).style.display = 'none';
}

// 대댓글 수정창 보이기
function recomment_update_open(recommentId, reCommentContent) {
  document.querySelector('.recommentUpdateBox-'+recommentId).style.display = 'block';
  document.querySelector('#formGroupExampleInput5').value = reCommentContent;
}
  
// 대댓글 수정창 닫기
function recomment_update_close(recommentId) {
  document.querySelector('.recommentUpdateBox-'+recommentId).style.display = 'none';
}