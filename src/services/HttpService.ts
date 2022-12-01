import axios from "axios";
import fetch from 'node-fetch'


export class GitlabService {
  static axiosService = axios.create({
    baseURL: "https://gitlab.com/api/v4",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GITLAB_TOKEN}`
    }
  })

  static async getUserProject(page = '1', per_page = '5') {

    const result = await this.axiosService.get(`/projects`, {
      params: {
        simple: true,
        page,
        per_page,
        membership: true
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

  static async getProjectWithId(projectId: string) {
    try {

      const result = await this.axiosService.get(`/projects/${projectId}?simple=true`)

      return result.data
    } catch (e) {
      return null
    }
  }

  static async mergeRequest(projectId: string, iidMergeRequest: string) {
    try {

      const result = await this.axiosService.put(`/projects/${projectId}/merge_requests/${iidMergeRequest}/merge`)

      return result.data
    } catch (e) {
      return null
    }
  }

  static async closeMergeRequest(projectId: string, iidMergeRequest: string) {
    try {

      const result = await this.axiosService.put(`/projects/${projectId}/merge_requests/${iidMergeRequest}?state_event=close`)

      return result.data
    } catch (e) {
      return null
    }
  }
}