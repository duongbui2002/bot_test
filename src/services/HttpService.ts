import axios from "axios";


export class GitlabHttpService {
  static axiosService = axios.create({
    baseURL: "https://gitlab.com/api/v4/",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer glpat-8EhzwjkNfvqFc2PVhcwr"
    }
  })

  static async getUserProject(userId: string, page = '1', per_page = '2') {

    const result = await this.axiosService.get(`/users/${userId}/projects?simple=true&&page=${page}&&per_page=${per_page}`);

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
}