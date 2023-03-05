$(document).ready(function () {
    petboast();
  });
  
  let currentPage = 0;
  let category = 'CHAT';
  
  function petboast() {
    let url = 'http://localhost:8080/posts?page=' + currentPage + '&size=9';
  
    if (category) {
      url += '&category=' + category;
    }
    $.ajax({
    url: url,
    type: 'GET',
    contentType: "application/json;",
    crossDomain: true,
    success: function (response) {
      console.log(response);

      let rows = response['content'];

      if (category) {
        rows = rows.filter(row => row.category === category);
      }

      $('#chat-posts').empty();

      for (let i = 0; i < rows.length; i++) {
        let id = rows[i]['id'];
        let title = rows[i]['title'];
        let writer = rows[i]['writer'];
        let likes = rows[i]['likes'];
        let image = rows[i]['image'];
        let createdAt = rows[i]['createdAt'];
        let view = rows[i]['view'];

        const year = createdAt[0]; // 2023
        const month = createdAt[1] - 1; // 1 (0부터 시작하므로 2월이면 1을 반환)
        const day = createdAt[2]; // 20

        const dateObj = new Date(year, month, day); 
        const formattedDate = dateObj.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
        //     <div class="col-md-4 d-flex ftco-animate">
        let temp_html = `
            <div class="col-md-4 d-flex">
              <div class="blog-entry align-self-stretch" style="width: 500px;">
                <a href="blog-single.html?id=${id}" class="block-20 rounded" style="background-image: url(${image});"></a>
                <div class="text p-4">
                  <div class="meta mb-2">
                    <div><a href="blog-single.html?id=${id}">${formattedDate}</a></div>
                    <div><a href="blog-single.html?id=${id}">${writer}</a></div>
                    <div><a href="blog-single.html?id=${id}" class="meta-chat">💚${likes}</a></div>
                    <div><a href="blog-single.html?id=${id}" class="meta-chat">👀 ${view}</a></div>
                  </div>
                    <div>
                    <h3 class="heading"><a href="blog-single.html?id=${id}">${title}</a></h3>
                    </div>
                    
                </div>
              </div>
            </div>`;
        $('#chat-posts').append(temp_html);
      }

      let totalPages = response['totalPages'];
      let buttonHtml = '';

      for (let i = 0; i < totalPages; i++) {
        if (i === currentPage) {
          buttonHtml += `<button class="page-button current" onclick="changePage(${i})">${i + 1}</button>`;
        } else {
          buttonHtml += `<button class="page-button" onclick="changePage(${i})">${i + 1}</button>`;
        }
      }

      $('#page-buttons').html(buttonHtml);
    }
  });
}

function changePage(pageNum) {
  currentPage = pageNum;
  petboast();
}
