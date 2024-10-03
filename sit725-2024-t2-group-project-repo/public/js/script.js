M.AutoInit();
let token = "";
let user = "";

// Handle form submission for the login form
const loginSubmitForm = () => {
    let formData = {};
    formData.username = $('#username').val();
    formData.password = $('#password').val();
    $.ajax({
        url: '/login',
        type: "POST",
        data: formData,
        dataType: "json", // Set dataType to a valid string
        success: function(response) {
            // Handle successful response
            localStorage.setItem("token", response.token);
            localStorage.setItem("user", formData.username);
            token = response.token;
            user = formData.username;
            alert("Logged in successfully");
            window.location.replace("index.html");
        },
        error: function(xhr, status, error) {
            // Handle error
            console.error("Error:", status, error);
            if (xhr.status === 400 && xhr.responseText) {
                const response = JSON.parse(xhr.responseText);
                alert("Error: " + response.error); // Access the specific error message
            } else {
                alert("Request failed: " + error); // Generic fallback for other errors
            }
        }
    });  
}

// Handle form submission for the registration form
const registerSubmitForm = () => {
    let formData = {};
    formData.username = $('#username').val();
    formData.password = $('#password').val();
    formData.email = $('#email').val();
    $.ajax({
        url: '/register',
        type: "POST",
        data: formData,
        dataType: "json", // Set dataType to a valid string
        success: function(response) {
            // Handle successful response
            alert("Success: " + response.message);
        },
        error: function(xhr, status, error) {
            // Handle error
            console.error("Error:", status, error);
            if (xhr.status === 400 && xhr.responseText) {
                const response = JSON.parse(xhr.responseText);
                alert("Error: " + response.error); // Access the specific error message
            } else {
                alert("Request failed: " + error); // Generic fallback for other errors
            }
        }
    });    
}

const socialMediaSubmitForm = () => {
    let formData = {};
    formData.username = user;
    formData.platform = $('#platform').val();
    formData.link = $('#link').val();
    $.ajax({
        url: '/addSocialMedia',
        type: "POST",
        data:  formData, // Send as JSON object
        dataType: "json", // Set dataType to a valid string
        success: function(response) {
            // Handle successful response
            alert("Success: " + response.message);
        },
        error: function(xhr, status, error) {
            // Handle error
            console.error("Error:", status, error);
            if (xhr.status === 400 && xhr.responseText) {
                const response = JSON.parse(xhr.responseText);
                alert("Error: " + response.error); // Access the specific error message
            } else {
                alert("Request failed: " + error); // Generic fallback for other errors
            }
        }
    });
}

const updateLinkSubmitForm = () => {
  let formData = {};
  formData.username = user;
  formData.platform = $('#edit-platform').val();
  formData.link = $('#edit-link').val();
  $.ajax({
      url: '/updateSocialMedia',
      type: "POST",
      data:  formData, // Send as JSON object
      dataType: "json", // Set dataType to a valid string
      success: function(response) {
          // Handle successful response
          alert("Success: " + response.message);
      },
      error: function(xhr, status, error) {
          // Handle error
          console.error("Error:", status, error);
          if (xhr.status === 400 && xhr.responseText) {
              const response = JSON.parse(xhr.responseText);
              alert("Error: " + response.error); // Access the specific error message
          } else {
              alert("Request failed: " + error); // Generic fallback for other errors
          }
      }
  });
}

const logout = () => {
  const savedToken = localStorage.getItem("token");
  if (savedToken !== "undefined"&& savedToken !== null){
    token = localStorage.removeItem("token");
    user = localStorage.removeItem("user");
  }
}

const fetchUsersList = () => {
  $("#main-content").empty().load("socialMediaHomepage.html");
  $.ajax({
    url: '/users',
    type: "GET",
    dataType: "json", // Set dataType to a valid string
    success: function(response) {
      $(".loading").hide();
      // Handle successful response
      const users = response.users;
      for (const userData of users){
        $("#users-list").append(
          "<li><a href='' class='user-link' id='"+userData.username+"'>"+userData.username+"</a></li>"
        )
        
      }

    },
    error: function(xhr, status, error) {
      $(".loading").hide();
        // Handle error
        console.error("Error:", status, error);
        if (xhr.status === 400 && xhr.responseText) {
            const response = JSON.parse(xhr.responseText);
            alert("Error: " + response.error); // Access the specific error message
        } else {
            alert("Request failed: " + error); // Generic fallback for other errors
        }
    }
});
}

const fetchUserLinksData = (username) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: '/userlinks',
      type: "POST",
      data:  JSON.stringify({ username: username }), // Send as JSON object,
      contentType: "application/json", // Specify the content type
      dataType: "json", // Set dataType to a valid string
      success: function(response) {      
        $(".loading").hide();
        // Handle successful response
        const userLinks = response.userLinks;
        resolve(userLinks);    
      },
      error: function(xhr, status, error) {
          // Handle error
          
          $(".loading").hide();
          if (xhr.status === 400 && xhr.responseText) {
              const response = JSON.parse(xhr.responseText);
              reject(response.error); // Access the specific error message
          } else {
              reject(error); // Generic fallback for other errors
          }
          
      }
    });
  });
}

const fetchUserLinkData = (id) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: '/userlink',
      type: "POST",
      data:  JSON.stringify({ id: id }), // Send as JSON object,
      contentType: "application/json", // Specify the content type
      dataType: "json", // Set dataType to a valid string
      success: function(response) {      
        $(".loading").hide();
        // Handle successful response
        const userLink = response.userLink;
        resolve(userLink);    
      },
      error: function(xhr, status, error) {
          // Handle error
          
          $(".loading").hide();
          if (xhr.status === 400 && xhr.responseText) {
              const response = JSON.parse(xhr.responseText);
              reject(response.error); // Access the specific error message
          } else {
              reject(error); // Generic fallback for other errors
          }
          
      }
    });
  });
}

const loadUserLinks = (username) => {
  // Load userLinks.html and ensure content is fully loaded before appending the username
  $("#main-content").empty().load("userLinks.html", function() {
    $(".loading").show();
    // This function runs after userLinks.html is fully loaded
    $("#username-header").text(username); // Use .text() to set the username 
    fetchUserLinksData(username)
    .then((userLinks) => {
      if(!userLinks || Object.keys(userLinks).length === 0){
        $("#user-social-media-links").append(
            "No social media link shared by " + username
        );
      }else{
        for (const userData of userLinks){
          $("#user-social-media-links").append(
            "<li>"+
            "<a href='"+userData.link+"' class='social-media-link'>"+userData.platform+"</a>"+
            "&nbsp;&nbsp;&nbsp;&nbsp;"+
            "<a href='' class='update-link' id='"+userData._id+"'>Edit</a>"+
            "</li>"
          )          
        }
      }
    }).catch((error) => {
      alert("Error: " + error);
      $("#user-social-media-links").append(
        "Failed to load social media link shared by " + username
      );
    }); // Now call the function to load the user links
  });
}

const fetchUserInfoData = () => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: '/user',
      type: "POST",
      data:  JSON.stringify({ username: user }), // Send as JSON object,
      contentType: "application/json", // Specify the content type
      dataType: "json", // Set dataType to a valid string
      success: function(response) {
        // Handle successful response
        const userData =  response.user;
        resolve(userData);
      },
      error: function(xhr, status, error) {
          // Handle error
          console.error("Error:", status, error);
          if (xhr.status === 400 && xhr.responseText) {
              const response = JSON.parse(xhr.responseText);
              reject(response.error); // Access the specific error message
          } else {
              reject(error); // Generic fallback for other errors
          }
      }
    });
  });
}

const fillEditLinkForm = (userData) => {
  if(userData){
    $("#main-content form #edit-platform").val(userData.platform);
    $("#main-content form #edit-link").val(userData.link);
  }else{
    console.log("Failed to load social media data");
  }
  
}

$(document).ready(function(){  
  const savedToken = localStorage.getItem("token"); 
  if(savedToken !== "undefined" && savedToken !== "" && savedToken !== null){
    $("#navigation").empty().load("authenticatedNav.html");
    token = localStorage.getItem("token");
    user = localStorage.getItem("user");
    fetchUsersList();
  }

  $(document).on('click',"#login-link",((e)=>{
    e.preventDefault();
    $("#main-content").empty().load("login.html");
  }));

  $(document).on('click',"#register-link",((e)=>{
    e.preventDefault();
    $("#main-content").empty().load("register.html");
  }));

  $(document).on('click',"#user-guidance-link",((e)=>{
    e.preventDefault();
    $("#main-content").empty().load("userGuidance.html");
  }));

  $(document).on('click','#login-submit-form', (()=>{
    loginSubmitForm();
  }));

  $(document).on('click', '#register-submit-form',(()=>{
    registerSubmitForm();
  }));

  $(document).on('click',"#logout-link",((e)=>{
    e.preventDefault();
    logout();
    window.location.replace("index.html");
  }));

  $(document).on('click',".user-link",function (e){
    e.preventDefault();
    const username = $(this).attr("id");
    loadUserLinks(username);
  });

  $(document).on('click',"#user-info-link",function (e){
    e.preventDefault();
    $("#main-content").empty().load("userInformation.html", function(){
      fetchUserInfoData()
      .then((userData) => {
        if(userData){
          $("#user-username").text(userData.username);
          $("#user-email").text(userData.email);
        }
      })
      .catch((error) => {
        alert("Failed to load user data: " + error);
      })
    });
  });

  $(document).on("click", "#add-social-media-link", function(e){
    e.preventDefault();
    $("#main-content").empty().load("addSocialMedia.html");
  });

  $(document).on("click", "#view-social-media-link", function(e){
    e.preventDefault();
    loadUserLinks(user);
  });

  $(document).on("click", ".update-link", function(e){
    e.preventDefault();
    const linkId = $(this).attr("id");
    $("#main-content").empty().load("editLink.html", function(){
      fetchUserLinkData(linkId)
      .then((userLink)=>{
        fillEditLinkForm(userLink);
      })
      .catch((error)=>{
        alert("Failed to fetch link data: " + error);
      })
    });
  });

  $(document).on("click", "#social-media-submit-form", function(e){
    e.preventDefault();
    socialMediaSubmitForm();
    loadUserLinks(user);
  });

  $(document).on("click", "#update-link-submit-form", function(e){
    e.preventDefault();
    updateLinkSubmitForm();
    loadUserLinks(user);
  });
});