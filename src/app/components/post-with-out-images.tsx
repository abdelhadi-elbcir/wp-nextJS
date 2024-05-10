import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";

interface Post {
  id: number;
  title: { rendered: string };
  link: string;
  image?: string;
  featured_media: number;
}

type PostWithOutImagesProps = {
  wp: string;
  in: string;
};

const PostWithOutImages: React.FC<PostWithOutImagesProps> = (props) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [msg, setMsg] = useState<string | null>(null); // Changed the type of msg state
  const ACCESS_TOKEN = "YOUR_ACCESS_TOKEN";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const BASE_URL = `https://${props.wp}/wp-json/wp/v2/posts?per_page=30`;
        const response = await axios.get<Post[]>(BASE_URL);
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching or processing data:", error);
      }
    };
    fetchData();
  }, []);

  const postData = (post: Post) => {
    const { title, link, image } = post;
    const requestBody = {
      content: {
        contentEntities: [
          {
            entityLocation: `${link}`,
            thumbnails: [{ resolvedUrl: image }],
          },
        ],
        title: `${title.rendered}`,
      },
      distribution: { linkedInDistributionTarget: {} },
      owner: `urn:li:organization:${props.in}`,
      subject: "Test Share Subject",
      text: { text: `${title.rendered} \n${link}\n#Recrutement` },
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
        setMsg(JSON.stringify(response.data));
      })
      .catch((error:any) => {
        console.error(error);
        setMsg(error.message);
      });
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
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
                <br />
                <button
                  className="bg-red-500 m-5 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => handleCopy(`${post.title.rendered}\n${post.link}\n#wadifaty`)}
                >
                  Copy
                </button>
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
      <div>{msg !== null ? msg : ""}</div> {/* Added rendering of msg state */}
    </div>
  );
};

const cellStyle: React.CSSProperties = {
  padding: "10px",
};

export default PostWithOutImages;
