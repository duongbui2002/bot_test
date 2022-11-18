import axios from "axios";


export class GitlabHttpService {
  static axiosService = axios.create({
    baseURL: "https://gitlab.com/api/v4/",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer glpat-8EhzwjkNfvqFc2PVhcwr"
    }
  })

  static async getUserProject(userId: string) {
    const result = await this.axiosService.get(`/users/${userId}/projects?simple=true`);
    return result.data
  }

  static async getProjectWithId(projectId: string) {
    try {

      const result = await this.axiosService.get(`/projects/${projectId}?simple=true`)
      return result.data
    } catch (e) {
      return null
    }
  }
}