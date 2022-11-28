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


    // const data = await fetch(
    //   `https://gitlab.com/api/v4/projects?simple=true&membership=true&page=${page}&per_page=${per_page}`,
    //   {
    //     method: "GET",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer glpat-zW832Vyb9srf6boavjp2`,
    //     },
    //   }
    // )


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
      // const data = await fetch(
      //   `https://gitlab.com/api/v4/projects/${projectId}?simple=true`,
      //   {
      //     method: "GET",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer glpat-zW832Vyb9srf6boavjp2`,
      //     },
      //   }
      // )
      //const result = await data.json()
      return result.data
    } catch (e) {
      return null
    }
  }
}