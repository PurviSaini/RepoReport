const converter = new showdown.Converter();
function fetchRepoStats() {
    const repoUrlInput = document.getElementById("repoUrl");
    const repoUrl = repoUrlInput.value.trim();
  
    if (!repoUrl) {
      alert("Please enter a valid repository URL.");
      return;
    }
  
    const [owner, repoName] = getOwnerAndRepoName(repoUrl);
  
    if (!owner || !repoName) {
      alert("Invalid repository URL format. Please enter a valid URL.");
      return;
    }
  
    const query = `
          query {
              repository(owner: "${owner}", name: "${repoName}") {
                  name
                  stargazers { totalCount }
                  watchers { totalCount }
                  forks { totalCount }
                  issues { totalCount }
                  pullRequests { totalCount }
                  releases { totalCount }
                  codeOfConduct {
                      body
                  }
                  labels {
                      totalCount
                  }
                  object(expression: "main:README.md") {
                      ... on Blob {
                          text
                      }
                  }
                  primaryLanguage {
                      name
                  }
                  goodFirstIssues: issues(labels: ["good first issue"]) {
                      totalCount
                  }
                  
              }
          }
      `;
  
    const accessToken = ""; //add your access token
    const endpoint = "https://api.github.com/graphql";
  
    // Show the loader while fetching data
    const loader = document.getElementById("loader");
    loader.style.display = "block";
  
    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Hide the loader once data is fetched
        loader.style.display = "none";
        document.getElementById("section").classList.remove("height-change");
        document.getElementById("readme").classList.add("border");
        document.getElementById("statsContainer").classList.add("border");
  
        const statsContainer = document.getElementById("statsContainer");
        if (data.data && data.data.repository) {
          const repository = data.data.repository;
          document.getElementById("repoName").textContent = repository.name;
          let stats = [
            { "Primary Language": repository.primaryLanguage.name },
            { Stars: repository.stargazers.totalCount },
            { Watchers: repository.watchers.totalCount },
            { "Pull requests": repository.pullRequests.totalCount },
            { Forks: repository.forks.totalCount },
            { Issues: repository.issues.totalCount },
            { Releases: repository.releases.totalCount },
            {
              "Code of Conduct": repository.codeOfConduct
                ? "Exists"
                : "No code of conduct found.",
            },
            { "Issue Labels": repository.labels.totalCount },
            {
              "Number of Good First Issue Labels":
                repository.goodFirstIssues.totalCount,
            },
          ];
          let md = repository.object.text;
          let readmeContent = repository.object
            ? converter.makeHtml(md)
            : "No README.md found.";
          document.getElementById("readme").innerHTML = readmeContent;
          
          statsContainer.innerHTML="";
          //loop to add each stat
          stats.forEach((obj) => {
            for (let key in obj) {
              statsContainer.innerHTML += `
                  <div class="card container-fluid m-2 gradient-border bg-dark" >
                      <div class="card-body">
                        <h5 class="card-title text-center dark-font fst-italic" style="color: gray;">${key}</h5>
                        <p class="card-text fs-3 fw-bold text-center">${obj[key]}</p>
                      </div>  
                  `;
            }
          });
        } else {
          readme.innerHTML =
            `<p class=text-danger>Error: Unable to fetch repository statistics.</p>`;
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
  function getOwnerAndRepoName(repoUrl) {
    const regex = /^https:\/\/github.com\/([^/]+)\/([^/]+)\/?$/;
    const match = repoUrl.match(regex);
    if (match && match.length === 3) {
      return [match[1], match[2]];
    }
    return [null, null];
  }
  