import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";

interface Post {
  id: number;
  title: { rendered: string };
  link: string;
  image?: string;
  featured_media: number;
}

interface Site {
  id: string;
  url: string;
}

const PostWithOutImages: any = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [site, setSite] = useState<Site>({
    id: "42472585",
    url: "wadifaty.ma",
  });
  const [msg, setMsg] = useState<{}>({});
  const ACCESS_TOKEN = "YOUR_ACCESS_TOKEN";

  const fetchData = async () => {
    try {
      const BASE_URL = `https://${site.url}/wp-json/wp/v2/posts?per_page=30`;
      const response = await axios.get<Post[]>(BASE_URL);
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching or processing data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [site]);

  const postData = (post: Post) => {
    const { title, link, image } = post;
    const requestBody = {
      content: {
        contentEntities: [
          {
            entityLocation: `${link}`,
            thumbnails: [
              {
                resolvedUrl: image,
              },
            ],
          },
        ],
        title: `${title.rendered}`,
      },
      distribution: {
        linkedInDistributionTarget: {},
      },
      owner: `urn:li:organization:${site.id}`,
      subject: "Test Share Subject",
      text: {
        text: `${title.rendered} \n${link}\n#Recrutement`,
      },
    };

    axios({
      method: "post",
      url: "https://api.linkedin.com/v2/shares",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(requestBody),
    })
      .then((response: AxiosResponse) => {
        console.log(response.data);
        setMsg(response.data);
      })
      .catch((error: any) => {
        console.error(error);
        setMsg(error);
      });
  };

  return (
    <div style={{ margin: "10px" }}>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr style={{ background: "#f2f2f2" }}>
            <th style={cellStyle}>ID</th>
            <th style={cellStyle}>post</th>
            <th style={cellStyle}>action</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={cellStyle}>{post.id}</td>
              <td style={cellStyle}>
                {post.title.rendered}
                <br />
                {post.link}
                <br />
                #wadifaty
              </td>
              <td>
                <button
                  onClick={() => postData(post)}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Post
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const cellStyle: React.CSSProperties = {
  padding: "10px",
};

export default PostWithOutImages;
