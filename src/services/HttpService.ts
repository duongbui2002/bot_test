import axios from "axios";
import {GitlabConnectionModel} from "@/models/gitlab-connection";


export class GitlabService {

  static axiosGitlabApiService = axios.create({
    baseURL: "https://gitlab.com/api/v4",
    headers: {
      "Content-Type": "application/json",
    }
  })
  static axiosGitlabOauthService = axios.create({
    baseURL: "https://gitlab.com/oauth",
  })

  static async getUserProject(token: string, page = '1', per_page = '5',) {

    const result = await this.axiosGitlabApiService.get(`/projects`, {
      params: {
        simple: true,
        page,
        per_page,
        membership: true
      },
      headers: {
        "Content-Type": 'application/json',
        Authorization: `Bearer ${token}`
      }
    });


    // const result = await data.json()
    let totalPages = result.headers['x-total-pages']
    let nextPage = result.headers['x-next-page']
    let prevPage = result.headers['x-prev-page']

    return {
      data: result.data,
      totalPages,
      nextPage,
      prevPage
    }


  }

  static async getProjectWithId(projectId: string, token: string) {
    try {

      const result = await this.axiosGitlabApiService.get(`/projects/${projectId}?simple=true`, {
        headers: {
          "Content-Type": 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      return result.data
    } catch (e) {
      return null
    }
  }

  static async mergeRequest(projectId: string, iidMergeRequest: string, token: string) {
    try {

      const result = await this.axiosGitlabApiService.put(`/projects/${projectId}/merge_requests/${iidMergeRequest}/merge`, {
        headers: {
          "Content-Type": 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      return result.data
    } catch (e) {
      return null
    }
  }

  static async closeMergeRequest(projectId: string, iidMergeRequest: string, token: string) {
    try {

      const result = await this.axiosGitlabApiService.put(`/projects/${projectId}/merge_requests/${iidMergeRequest}?state_event=close`, {}, {
        headers: {
          "Content-Type": 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      return result.data
    } catch (e) {
      return null
    }
  }

  static async addMemberToProject(data: AddMemberData, token: string) {
    try {

      const result = await this.axiosGitlabApiService.put(`/projects/${data.projectID}/members`, {}, {
        headers: {
          "Content-Type": 'application/json',
          Authorization: `Bearer ${token}`
        },
        params: {
          user_id: data.userID,
          access_level: data.accessLevel
        }
      })

      return result.data
    } catch (e) {
      return null
    }
  }

  static async refreshGitlabToken(refreshToken: string) {
    try {
      const {data} = await this.axiosGitlabOauthService.post(`/token`, {}, {
        params: {
          client_id: process.env.GITLAB_APPLICATION_ID,
          client_secret: process.env.GITLAB_SECRET,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          redirect_uri: `${process.env.BASE_URL}/oauth/gitlab/callback`
        }
      })
      const updatedConnection = await GitlabConnectionModel.updateOne({refreshToken}, {
        $set: {
          refreshToken: data.refresh_token,
          accessToken: data.access_token,
          accessTokenExpiresAt: data.created_at + data.expires_in
        }
      }, {
        new: true
      })
      return updatedConnection;
    } catch (e) {
      await GitlabConnectionModel.deleteMany({refreshToken})
      return null

    }
  }
}